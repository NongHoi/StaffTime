const MaterialIssuance = require('../../schema/MaterialIssuance');
const Material = require('../../schema/Material');
const WorkSchedule = require('../../schema/WorkSchedule');

// Get all material issuances
exports.getAllMaterialIssuances = async (req, res) => {
  try {
    const issuances = await MaterialIssuance.find()
      .populate('material_id', 'name unit')
      .populate('work_schedule_id', 'work_date event_name')
      .populate('issued_by', 'full_name')
      .sort({ issued_date: -1 });
    res.json(issuances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get material issuances by work schedule
exports.getIssuancesByWorkSchedule = async (req, res) => {
  try {
    const issuances = await MaterialIssuance.find({ work_schedule_id: req.params.workScheduleId })
      .populate('material_id', 'name unit')
      .populate('issued_by', 'full_name')
      .sort({ issued_date: -1 });
    res.json(issuances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new material issuance
exports.createMaterialIssuance = async (req, res) => {
  try {
    // Check if material exists and has sufficient quantity
    const material = await Material.findById(req.body.material_id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.quantity < req.body.quantity_issued) {
      return res.status(400).json({ message: 'Insufficient material quantity' });
    }

    // Check if work schedule exists
    const workSchedule = await WorkSchedule.findById(req.body.work_schedule_id);
    if (!workSchedule) {
      return res.status(404).json({ message: 'Work schedule not found' });
    }

    const issuance = new MaterialIssuance({
      material_id: req.body.material_id,
      work_schedule_id: req.body.work_schedule_id,
      quantity_issued: req.body.quantity_issued,
      issued_by: req.session.user.id, // Assuming req.user is set by auth middleware
      notes: req.body.notes
    });

    const newIssuance = await issuance.save();

    // Update material quantity
    material.quantity -= req.body.quantity_issued;
    await material.save();

    const populatedIssuance = await MaterialIssuance.findById(newIssuance._id)
      .populate('material_id', 'name unit')
      .populate('work_schedule_id', 'work_date event_name')
      .populate('issued_by', 'full_name');

    res.status(201).json(populatedIssuance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update material issuance
exports.updateMaterialIssuance = async (req, res) => {
  try {
    const issuance = await MaterialIssuance.findById(req.params.id);
    if (!issuance) {
      return res.status(404).json({ message: 'Material issuance not found' });
    }

    // If quantity is being changed, adjust material stock
    if (req.body.quantity_issued !== undefined && req.body.quantity_issued !== issuance.quantity_issued) {
      const material = await Material.findById(issuance.material_id);
      if (!material) {
        return res.status(404).json({ message: 'Material not found' });
      }

      const quantityDifference = req.body.quantity_issued - issuance.quantity_issued;
      if (material.quantity < quantityDifference) {
        return res.status(400).json({ message: 'Insufficient material quantity' });
      }

      material.quantity -= quantityDifference;
      await material.save();
      issuance.quantity_issued = req.body.quantity_issued;
    }

    if (req.body.notes !== undefined) issuance.notes = req.body.notes;

    const updatedIssuance = await issuance.save();
    const populatedIssuance = await MaterialIssuance.findById(updatedIssuance._id)
      .populate('material_id', 'name unit')
      .populate('work_schedule_id', 'work_date event_name')
      .populate('issued_by', 'full_name');

    res.json(populatedIssuance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete material issuance
exports.deleteMaterialIssuance = async (req, res) => {
  try {
    const issuance = await MaterialIssuance.findById(req.params.id);
    if (!issuance) {
      return res.status(404).json({ message: 'Material issuance not found' });
    }

    // Return quantity back to material stock
    const material = await Material.findById(issuance.material_id);
    if (material) {
      material.quantity += issuance.quantity_issued;
      await material.save();
    }

    await issuance.remove();
    res.json({ message: 'Material issuance deleted and stock returned' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
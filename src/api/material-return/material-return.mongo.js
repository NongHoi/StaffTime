const MaterialIssuanceForm = require('../../schema/MaterialIssuanceForm');
const Material = require('../../schema/Material');

// Get all issuance forms for return
const getIssuanceFormsForReturn = async (req, res) => {
  try {
    const forms = await MaterialIssuanceForm.find()
      .populate('work_schedule_id', 'job_name date')
      .populate('issued_by', 'full_name')
      .populate('items.material_id', 'name unit')
      .sort({ created_at: -1 });

    res.json(forms);
  } catch (error) {
    console.error('getIssuanceFormsForReturn error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Return materials from a show
const returnMaterials = async (req, res) => {
  try {
    const { formId } = req.params;
    const { returned_items, lost_items, notes } = req.body;
    // returned_items: [{ material_id, quantity_returned }]
    // lost_items: [{ material_id, quantity_lost, reason }]

    // Check if user is logged in
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const form = await MaterialIssuanceForm.findById(formId).populate('items.material_id');
    if (!form) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu xuất' });
    }

    // Update material quantities
    for (const returnedItem of returned_items) {
      const material = await Material.findById(returnedItem.material_id);
      if (material) {
        material.quantity += returnedItem.quantity_returned;
        await material.save();
      }
    }

    // Update form with return info
    form.return_info = {
      returned_items,
      lost_items,
      returned_by: req.session.user.id,
      returned_at: new Date(),
      notes
    };
    form.status = 'returned';
    await form.save();

    res.json({ message: 'Nhập kho thành công', form });
  } catch (error) {
    console.error('returnMaterials error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get return history
const getReturnHistory = async (req, res) => {
  try {
    const forms = await MaterialIssuanceForm.find({ status: 'returned' })
      .populate('work_schedule_id', 'job_name date')
      .populate('issued_by', 'full_name')
      .populate('return_info.returned_by', 'full_name')
      .populate('items.material_id', 'name unit')
      .populate('return_info.returned_items.material_id', 'name unit')
      .populate('return_info.lost_items.material_id', 'name unit')
      .sort({ 'return_info.returned_at': -1 });

    res.json(forms);
  } catch (error) {
    console.error('getReturnHistory error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIssuanceFormsForReturn,
  returnMaterials,
  getReturnHistory
};

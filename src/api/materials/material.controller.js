const Material = require('../../models/Material');

// Get all materials
exports.getAllMaterials = async (req, res) => {
  console.log('Getting all materials, user:', req.user);
  try {
    const materials = await Material.find().sort({ created_at: -1 });
    console.log('Found materials:', materials.length);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new material
exports.createMaterial = async (req, res) => {
  console.log('Creating material:', req.body);
  const material = new Material({
    name: req.body.name,
    description: req.body.description,
    quantity: req.body.quantity,
    unit: req.body.unit,
    category: req.body.category
  });

  try {
    const newMaterial = await material.save();
    console.log('Material created:', newMaterial);
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update material
exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (req.body.name) material.name = req.body.name;
    if (req.body.description) material.description = req.body.description;
    if (req.body.quantity !== undefined) material.quantity = req.body.quantity;
    if (req.body.unit) material.unit = req.body.unit;
    if (req.body.category) material.category = req.body.category;

    const updatedMaterial = await material.save();
    res.json(updatedMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    await material.remove();
    res.json({ message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
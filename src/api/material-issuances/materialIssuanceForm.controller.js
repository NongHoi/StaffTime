const MaterialIssuanceForm = require('../../models/MaterialIssuanceForm');
const MaterialIssuance = require('../../models/MaterialIssuance');
const Material = require('../../models/Material');
const WorkSchedule = require('../../models/LegacyWorkSchedule');
const ExcelJS = require('exceljs');

// Create a grouped issuance form (single request containing many items)
exports.createIssuanceForm = async (req, res) => {
  try {
    const { work_schedule_id, items, notes } = req.body;

    if (!work_schedule_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Thiếu lịch làm việc hoặc danh sách vật tư' });
    }

    const workSchedule = await WorkSchedule.findById(work_schedule_id);
    if (!workSchedule) return res.status(404).json({ message: 'Work schedule not found' });

    // Validate materials and stock
    const materialDocs = {};
    for (const it of items) {
      const mat = await Material.findById(it.material_id);
      if (!mat) return res.status(404).json({ message: `Material not found: ${it.material_id}` });
      if (mat.quantity < it.quantity) return res.status(400).json({ message: `Insufficient stock for ${mat.name}` });
      materialDocs[it.material_id] = mat;
    }

    // Deduct stock and create individual issuance records
    const issuanceRecords = [];
    for (const it of items) {
      const mat = materialDocs[it.material_id];
      mat.quantity -= it.quantity;
      await mat.save();

      const issuance = new MaterialIssuance({
        material_id: it.material_id,
        work_schedule_id,
        quantity_issued: it.quantity,
        issued_by: req.session.user.id,
        notes: notes || ''
      });
      const saved = await issuance.save();
      issuanceRecords.push(saved);
    }

    // Save form (aggregate)
    const form = new MaterialIssuanceForm({
      work_schedule_id,
      issued_by: req.session.user.id,
      items: items.map(i => ({ material_id: i.material_id, quantity: i.quantity })),
      notes: notes || ''
    });
    const savedForm = await form.save();

    // Populate response
    const populatedForm = await MaterialIssuanceForm.findById(savedForm._id)
      .populate('work_schedule_id', 'date job_name')
      .populate('issued_by', 'full_name')
      .populate('items.material_id', 'name unit');

    res.status(201).json({ form: populatedForm, issuances: issuanceRecords });
  } catch (error) {
    console.error('createIssuanceForm error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getForms = async (req, res) => {
  try {
    const forms = await MaterialIssuanceForm.find()
      .populate('work_schedule_id', 'date job_name')
      .populate('issued_by', 'full_name')
      .populate('items.material_id', 'name unit')
      .sort({ created_at: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFormById = async (req, res) => {
  try {
    const form = await MaterialIssuanceForm.findById(req.params.id)
      .populate('work_schedule_id', 'date job_name')
      .populate('issued_by', 'full_name')
      .populate('items.material_id', 'name unit');
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportFormToExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await MaterialIssuanceForm.findById(id)
      .populate('work_schedule_id', 'date job_name')
      .populate('issued_by', 'full_name')
      .populate('items.material_id', 'name unit');

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Phiếu Xuất Vật Tư');

    // Add headers
    worksheet.columns = [
      { header: 'Ngày Xuất', key: 'date', width: 15 },
      { header: 'Show/Lịch', key: 'show', width: 30 },
      { header: 'Người Xuất', key: 'issuer', width: 20 },
      { header: 'Vật Tư', key: 'material', width: 30 },
      { header: 'Số Lượng', key: 'quantity', width: 10 },
      { header: 'Đơn Vị', key: 'unit', width: 10 },
      { header: 'Ghi Chú', key: 'notes', width: 30 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Add data for this form
    const showName = form.work_schedule_id ? `${form.work_schedule_id.job_name} - ${new Date(form.work_schedule_id.date).toLocaleDateString('vi-VN')}` : 'N/A';
    const issuerName = form.issued_by ? form.issued_by.full_name : 'N/A';

    form.items.forEach(item => {
      worksheet.addRow({
        date: new Date(form.created_at).toLocaleDateString('vi-VN'),
        show: showName,
        issuer: issuerName,
        material: item.material_id ? item.material_id.name : 'N/A',
        quantity: item.quantity,
        unit: item.material_id ? item.material_id.unit : '',
        notes: form.notes || ''
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=phieu-xuat-${id}-${new Date().toISOString().split('T')[0]}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('exportFormToExcel error:', error);
    res.status(500).json({ message: error.message });
  }
};
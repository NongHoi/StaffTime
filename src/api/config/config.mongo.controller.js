// Simple config storage using environment variables or in-memory store
// In production, this should use a proper database table

let configStore = {
    night_shift_start: '18:00',
    night_shift_end: '06:00',
    overtime_threshold: 8,
    tax_rate: 0.1
};

module.exports = (io, connectedUsers) => {
    const getConfig = async (req, res) => {
        try {
            res.json(configStore);
        } catch (err) {
            console.error('getConfig error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const updateConfig = async (req, res) => {
        try {
            const { night_shift_start, night_shift_end, overtime_threshold, tax_rate } = req.body;

            if (night_shift_start) configStore.night_shift_start = night_shift_start;
            if (night_shift_end) configStore.night_shift_end = night_shift_end;
            if (overtime_threshold !== undefined) configStore.overtime_threshold = Number(overtime_threshold);
            if (tax_rate !== undefined) configStore.tax_rate = Number(tax_rate);

            res.json({ 
                message: 'Cập nhật cấu hình thành công', 
                config: configStore 
            });

        } catch (err) {
            console.error('updateConfig error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return {
        getConfig,
        updateConfig
    };
};
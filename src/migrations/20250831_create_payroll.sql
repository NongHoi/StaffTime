-- Bảng lưu bảng lương đã tính cho từng user
CREATE TABLE IF NOT EXISTS payroll (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_day NUMERIC(6, 2) NOT NULL,
    total_night NUMERIC(6, 2) NOT NULL,
    day_shift_rate NUMERIC(10, 2) NOT NULL,
    night_shift_rate NUMERIC(10, 2) NOT NULL,
    allowance NUMERIC(10, 2),
    bonus NUMERIC(10, 2),
    total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payroll_user_month_year ON payroll (user_id, month, year);
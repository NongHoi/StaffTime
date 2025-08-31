-- Bảng lưu lịch làm việc
CREATE TABLE IF NOT EXISTS work_schedule (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    job_name VARCHAR(255),
    start_time TIME,
    location VARCHAR(255),
    note TEXT,
    created_by INTEGER REFERENCES users (id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng lưu đăng ký lịch làm của nhân viên
CREATE TABLE IF NOT EXISTS work_schedule_registration (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES work_schedule (id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (schedule_id, user_id)
);
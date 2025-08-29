-- Tạo bảng roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    role_id INTEGER REFERENCES roles (id),
    type VARCHAR(20) DEFAULT 'parttime', -- parttime, fulltime
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng attendance (chấm công)
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP,
    date DATE NOT NULL,
    type VARCHAR(20) DEFAULT 'normal', -- normal, night
    note TEXT
);

-- Tạo bảng salary
CREATE TABLE IF NOT EXISTS salary (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    base_salary NUMERIC NULL,
    night_shift_rate NUMERIC NULL,
    day_shift_rate NUMERIC NULL,
    allowance NUMERIC NULL,
    bonus NUMERIC NULL,
    total NUMERIC NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng show (lương show cho fulltime)
CREATE TABLE IF NOT EXISTS
show (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price NUMERIC,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng config (cấu hình giờ ca đêm/ngày)
CREATE TABLE IF NOT EXISTS config (
    id SERIAL PRIMARY KEY,
    night_shift_start TIME,
    night_shift_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm các role mặc định
INSERT INTO
    roles (name)
VALUES ('admin'),
    ('manager'),
    ('user') ON CONFLICT DO NOTHING;
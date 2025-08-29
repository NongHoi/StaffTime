-- Migration: Tạo bảng night_shift_time để lưu giờ bắt đầu và kết thúc ca đêm
CREATE TABLE IF NOT EXISTS night_shift_time (
    id SERIAL PRIMARY KEY,
    night_shift_start TIME NOT NULL,
    night_shift_end TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
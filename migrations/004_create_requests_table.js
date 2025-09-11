const pool = require('../src/config/db');

const up = async () => {
  await pool.query(`
    CREATE TABLE requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      request_type VARCHAR(50) NOT NULL DEFAULT 'leave', -- e.g., 'leave', 'remote', 'other'
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewer_comment TEXT
    );
  `);
  console.log('Migration: requests table created');
};

const down = async () => {
  await pool.query('DROP TABLE IF EXISTS requests;');
  console.log('Rollback: requests table dropped');
};

// Chạy migration dựa trên đối số dòng lệnh
const args = process.argv.slice(2);
if (args[0] === 'up') {
  up().catch(err => console.error(err)).finally(() => pool.end());
} else if (args[0] === 'down') {
  down().catch(err => console.error(err)).finally(() => pool.end());
}

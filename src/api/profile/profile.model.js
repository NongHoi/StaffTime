const pool = require('../../config/db');

const updateUserProfile = async (userId, { fullname, phone, email, bank_account_number, bank_name }) => {
  const result = await pool.query(
    `UPDATE users SET fullname = $1, phone = $2, email = $3, bank_account_number = $4, bank_name = $5 WHERE id = $6 RETURNING *`,
    [fullname, phone, email, bank_account_number, bank_name, userId]
  );
  return result.rows[0];
};

const getUserProfile = async (userId) => {
  const result = await pool.query(
    `SELECT id, fullname, phone, email, bank_account_number, bank_name FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0];
};

module.exports = { updateUserProfile, getUserProfile };

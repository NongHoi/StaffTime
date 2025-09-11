const pool = require('../../config/db');

const createUser = async ({ username, password, fullname, phone, email, role_id, type, bank_account_number, bank_name }) => {
  const result = await pool.query(
    `INSERT INTO users (username, password, fullname, phone, email, role_id, type, bank_account_number, bank_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [username, password, fullname, phone, email, role_id, type, bank_account_number || null, bank_name || null]
  );
  return result.rows[0];
};

const findUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};

const findById = async (id) => {
    const result = await pool.query('SELECT id, username, fullname, role_id FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

const findAdminsAndManagers = async () => {
    const result = await pool.query('SELECT id FROM users WHERE role_id = 1 OR role_id = 2');
    return result.rows;
};

module.exports = { createUser, findUserByUsername, findById, findAdminsAndManagers };

const pool = require('../config/db');

// CRUD cho work_schedule
const createWorkSchedule = async ({ date, job_name, start_time, location, note, created_by }) => {
  const result = await pool.query(
    `INSERT INTO work_schedule (date, job_name, start_time, location, note, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [date, job_name, start_time, location, note, created_by]
  );
  return result.rows[0];
};

const getWorkSchedulesByMonth = async (year, month) => {
  const result = await pool.query(
    `SELECT * FROM work_schedule WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2 ORDER BY date, start_time`,
    [year, month]
  );
  return result.rows;
};

const getWorkScheduleById = async (id) => {
  const result = await pool.query('SELECT * FROM work_schedule WHERE id = $1', [id]);
  return result.rows[0];
};

const updateWorkSchedule = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const result = await pool.query(
    `UPDATE work_schedule SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0];
};

const deleteWorkSchedule = async (id) => {
  await pool.query('DELETE FROM work_schedule WHERE id = $1', [id]);
};

// Đăng ký lịch làm
const registerWorkSchedule = async (schedule_id, user_id) => {
  const result = await pool.query(
    `INSERT INTO work_schedule_registration (schedule_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
    [schedule_id, user_id]
  );
  return result.rows[0];
};

const getRegistrationsBySchedule = async (schedule_id) => {
  const result = await pool.query(
    `SELECT u.id, u.fullname, u.username FROM work_schedule_registration r JOIN users u ON r.user_id = u.id WHERE r.schedule_id = $1`,
    [schedule_id]
  );
  return result.rows;
};

const getSchedulesForUser = async (user_id, year, month) => {
  let query = `SELECT s.* FROM work_schedule_registration r JOIN work_schedule s ON r.schedule_id = s.id WHERE r.user_id = $1`;
  let params = [user_id];
  if (year && month) {
    const y = Number(year);
    const m = Number(month);
    query += ` AND EXTRACT(YEAR FROM s.date) = $2 AND EXTRACT(MONTH FROM s.date) = $3`;
    params = [user_id, y, m];
  }
  query += ` ORDER BY s.date, s.start_time`;
  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = {
  createWorkSchedule,
  getWorkSchedulesByMonth,
  getWorkScheduleById,
  updateWorkSchedule,
  deleteWorkSchedule,
  registerWorkSchedule,
  getRegistrationsBySchedule,
  getSchedulesForUser
};

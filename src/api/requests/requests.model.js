const pool = require('../../config/db');

const createRequest = async ({ user_id, request_type, start_date, end_date, reason }) => {
    const result = await pool.query(
        `INSERT INTO requests (user_id, request_type, start_date, end_date, reason)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, request_type, start_date, end_date, reason]
    );
    return result.rows[0];
};

const updateRequestStatus = async (id, status, reviewed_by, reviewer_comment) => {
    const result = await pool.query(
        `UPDATE requests SET status = $1, reviewed_by = $2, reviewer_comment = $3 
         WHERE id = $4 RETURNING *`,
        [status, reviewed_by, reviewer_comment, id]
    );
    return result.rows[0];
};

const getAllRequests = async () => {
    const result = await pool.query(
        `SELECT r.*, u.username, u.fullname 
         FROM requests r
         JOIN users u ON r.user_id = u.id
         ORDER BY r.created_at DESC`
    );
    return result.rows;
};

const getRequestsByUserId = async (user_id) => {
    const result = await pool.query(
        `SELECT * FROM requests WHERE user_id = $1 ORDER BY created_at DESC`,
        [user_id]
    );
    return result.rows;
};

const getRequestById = async (id) => {
    const result = await pool.query(
        `SELECT r.*, u.username, u.fullname 
         FROM requests r
         JOIN users u ON r.user_id = u.id
         WHERE r.id = $1`,
        [id]
    );
    return result.rows[0];
};


module.exports = {
    createRequest,
    updateRequestStatus,
    getAllRequests,
    getRequestsByUserId,
    getRequestById,
};

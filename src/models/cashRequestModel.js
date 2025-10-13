/**
 * Cash Request Model
 * Handles database operations for petty cash requests
 */

import dbConfig from '../config/database.cjs';

/**
 * Get all petty cash requests with optional filtering
 * @param {Object} filters - Optional filters (technician_id, status)
 * @returns {Promise<Array>} Array of cash requests
 */
export const getAllCashRequests = async (filters = {}) => {
    try {
        let query = 'SELECT * FROM petty_cash_requests';
        const params = [];
        const conditions = [];

        // Apply filters if provided
        if (filters.technician_id) {
            conditions.push(`technician_id = $${params.length + 1}`);
            params.push(filters.technician_id);
        }

        if (filters.status) {
            conditions.push(`status = $${params.length + 1}`);
            params.push(filters.status);
        }

        if (filters.ticket_id) {
            conditions.push(`ticket_id = $${params.length + 1}`);
            params.push(filters.ticket_id);
        }

        // Add WHERE clause if there are conditions
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Order by created_at descending (newest first)
        query += ' ORDER BY created_at DESC';

        const result = await dbConfig.pool.query(query, params);
        return result.rows;
    } catch (error) {
        throw new Error(`Database error in getAllCashRequests: ${error.message}`);
    }
};

/**
 * Get a single petty cash request by ID
 * @param {string} id - Cash request UUID
 * @returns {Promise<Object|null>} Cash request object or null if not found
 */
export const getCashRequestById = async (id) => {
    try {
        const query = 'SELECT * FROM petty_cash_requests WHERE id = $1';
        const result = await dbConfig.pool.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        throw new Error(`Database error in getCashRequestById: ${error.message}`);
    }
};

/**
 * Create a new petty cash request
 * @param {Object} cashRequestData - Cash request data
 * @returns {Promise<Object>} Created cash request
 */
export const createCashRequest = async (cashRequestData) => {
    try {
        const { technician_id, ticket_id, amount, description } = cashRequestData;

        const query = `
      INSERT INTO petty_cash_requests (technician_id, ticket_id, amount, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

        const result = await dbConfig.pool.query(query, [technician_id, ticket_id, amount, description]);
        return result.rows[0];
    } catch (error) {
        throw new Error(`Database error in createCashRequest: ${error.message}`);
    }
};

/**
 * Update an existing petty cash request
 * @param {string} id - Cash request UUID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated cash request or null if not found
 */
export const updateCashRequest = async (id, updateData) => {
    try {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Build dynamic UPDATE query based on provided fields
        if (updateData.amount !== undefined) {
            fields.push(`amount = $${paramIndex++}`);
            values.push(updateData.amount);
        }

        if (updateData.description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(updateData.description);
        }

        if (updateData.status !== undefined) {
            fields.push(`status = $${paramIndex++}`);
            values.push(updateData.status);
        }

        // If no fields to update, return null
        if (fields.length === 0) {
            return null;
        }

        // Add the ID as the last parameter
        values.push(id);

        const query = `
      UPDATE petty_cash_requests
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

        const result = await dbConfig.pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        throw new Error(`Database error in updateCashRequest: ${error.message}`);
    }
};

/**
 * Delete a petty cash request
 * @param {string} id - Cash request UUID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteCashRequest = async (id) => {
    try {
        const query = 'DELETE FROM petty_cash_requests WHERE id = $1 RETURNING id';
        const result = await dbConfig.pool.query(query, [id]);
        return result.rowCount > 0;
    } catch (error) {
        throw new Error(`Database error in deleteCashRequest: ${error.message}`);
    }
};

/**
 * Update the status of a cash request
 * @param {string} id - Cash request UUID
 * @param {string} status - New status (pending, approved, rejected)
 * @returns {Promise<Object|null>} Updated cash request or null if not found
 */
export const updateCashRequestStatus = async (id, status) => {
    try {
        const query = `
      UPDATE petty_cash_requests
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;

        const result = await dbConfig.pool.query(query, [status, id]);
        return result.rows[0] || null;
    } catch (error) {
        throw new Error(`Database error in updateCashRequestStatus: ${error.message}`);
    }
};

/**
 * Get cash requests statistics for a technician
 * @param {string} technician_id - Technician UUID
 * @returns {Promise<Object>} Statistics object
 */
export const getCashRequestStatsByTechnician = async (technician_id) => {
    try {
        const query = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) as total_approved_amount,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as total_pending_amount
      FROM petty_cash_requests
      WHERE technician_id = $1
    `;

        const result = await dbConfig.pool.query(query, [technician_id]);
        return result.rows[0];
    } catch (error) {
        throw new Error(`Database error in getCashRequestStatsByTechnician: ${error.message}`);
    }
};

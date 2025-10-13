/**
 * Cash Request Service
 * Business logic layer for petty cash requests
 */

import * as CashRequestModel from '../models/cashRequestModel.js';

/**
 * Get all cash requests with optional filtering
 * @param {Object} filters - Optional filters (technician_id, status, ticket_id)
 * @returns {Promise<Array>} Array of cash requests
 */
export const getAllCashRequests = async (filters = {}) => {
    try {
        const cashRequests = await CashRequestModel.getAllCashRequests(filters);
        return cashRequests;
    } catch (error) {
        throw new Error(`Service error in getAllCashRequests: ${error.message}`);
    }
};

/**
 * Get a single cash request by ID
 * @param {string} id - Cash request UUID
 * @returns {Promise<Object|null>} Cash request object or null
 */
export const getCashRequestById = async (id) => {
    try {
        const cashRequest = await CashRequestModel.getCashRequestById(id);
        return cashRequest;
    } catch (error) {
        throw new Error(`Service error in getCashRequestById: ${error.message}`);
    }
};

/**
 * Create a new cash request
 * @param {Object} cashRequestData - Cash request data
 * @returns {Promise<Object>} Created cash request
 */
export const createCashRequest = async (cashRequestData) => {
    try {
        // Validate required fields
        const { technician_id, ticket_id, amount, description } = cashRequestData;

        if (!technician_id || !ticket_id || !amount || !description) {
            throw new Error('Missing required fields: technician_id, ticket_id, amount, description');
        }

        // Validate amount is positive
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        // Validate description is not empty
        if (!description.trim()) {
            throw new Error('Description cannot be empty');
        }

        const newCashRequest = await CashRequestModel.createCashRequest(cashRequestData);
        return newCashRequest;
    } catch (error) {
        throw new Error(`Service error in createCashRequest: ${error.message}`);
    }
};

/**
 * Update an existing cash request
 * @param {string} id - Cash request UUID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated cash request or null
 */
export const updateCashRequest = async (id, updateData) => {
    try {
        // Check if cash request exists
        const existingRequest = await CashRequestModel.getCashRequestById(id);
        if (!existingRequest) {
            return null;
        }

        // Validate amount if provided
        if (updateData.amount !== undefined && updateData.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        // Validate status if provided
        if (updateData.status && !['pending', 'approved', 'rejected'].includes(updateData.status)) {
            throw new Error('Invalid status. Must be: pending, approved, or rejected');
        }

        // Validate description if provided
        if (updateData.description !== undefined && !updateData.description.trim()) {
            throw new Error('Description cannot be empty');
        }

        const updatedCashRequest = await CashRequestModel.updateCashRequest(id, updateData);
        return updatedCashRequest;
    } catch (error) {
        throw new Error(`Service error in updateCashRequest: ${error.message}`);
    }
};

/**
 * Delete a cash request
 * @param {string} id - Cash request UUID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteCashRequest = async (id) => {
    try {
        // Check if cash request exists
        const existingRequest = await CashRequestModel.getCashRequestById(id);
        if (!existingRequest) {
            return false;
        }

        const deleted = await CashRequestModel.deleteCashRequest(id);
        return deleted;
    } catch (error) {
        throw new Error(`Service error in deleteCashRequest: ${error.message}`);
    }
};

/**
 * Approve a cash request
 * @param {string} id - Cash request UUID
 * @returns {Promise<Object|null>} Updated cash request or null
 */
export const approveCashRequest = async (id) => {
    try {
        const cashRequest = await CashRequestModel.getCashRequestById(id);

        if (!cashRequest) {
            return null;
        }

        // Check if already approved
        if (cashRequest.status === 'approved') {
            throw new Error('Cash request is already approved');
        }

        const updatedRequest = await CashRequestModel.updateCashRequestStatus(id, 'approved');
        return updatedRequest;
    } catch (error) {
        throw new Error(`Service error in approveCashRequest: ${error.message}`);
    }
};

/**
 * Reject a cash request
 * @param {string} id - Cash request UUID
 * @returns {Promise<Object|null>} Updated cash request or null
 */
export const rejectCashRequest = async (id) => {
    try {
        const cashRequest = await CashRequestModel.getCashRequestById(id);

        if (!cashRequest) {
            return null;
        }

        // Check if already rejected
        if (cashRequest.status === 'rejected') {
            throw new Error('Cash request is already rejected');
        }

        const updatedRequest = await CashRequestModel.updateCashRequestStatus(id, 'rejected');
        return updatedRequest;
    } catch (error) {
        throw new Error(`Service error in rejectCashRequest: ${error.message}`);
    }
};

/**
 * Get statistics for a technician's cash requests
 * @param {string} technician_id - Technician UUID
 * @returns {Promise<Object>} Statistics object
 */
export const getTechnicianStats = async (technician_id) => {
    try {
        const stats = await CashRequestModel.getCashRequestStatsByTechnician(technician_id);
        return stats;
    } catch (error) {
        throw new Error(`Service error in getTechnicianStats: ${error.message}`);
    }
};

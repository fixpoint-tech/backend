import { issueRealtimeUpdate } from '../socket/socket.js';
/**
 * Cash Request Controller
 * Handles HTTP requests for petty cash requests
 */

import * as CashRequestService from '../services/cashRequestService.js';
import { validationResult } from 'express-validator';

/**
 * Get all cash requests with optional filtering
 * @route GET /api/v1/cash-requests
 * @query {string} technician_id - Optional: Filter by technician ID
 * @query {string} status - Optional: Filter by status (pending, approved, rejected)
 * @query {string} issue_id - Optional: Filter by issue ID
 */
export const getAllCashRequests = async (req, res) => {
    try {
        const filters = {};

        // Extract query parameters for filtering
        if (req.query.technician_id) {
            filters.technician_id = req.query.technician_id;
        }

        if (req.query.status) {
            filters.status = req.query.status;
        }

        if (req.query.issue_id) {
            filters.issue_id = req.query.issue_id;
        }

        const cashRequests = await CashRequestService.getAllCashRequests(filters);

        res.status(200).json({
            success: true,
            message: 'Cash requests retrieved successfully',
            count: cashRequests.length,
            data: cashRequests
        });
    } catch (error) {
        console.error('Error in getAllCashRequests:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to retrieve cash requests',
            error: error.message
        });
    }
};

/**
 * Get a single cash request by ID
 * @route GET /api/v1/cash-requests/:id
 * @param {string} id - Cash request UUID
 */
export const getCashRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const cashRequest = await CashRequestService.getCashRequestById(id);

        if (!cashRequest) {
            return res.status(404).json({
                success: false,
                message: 'Cash request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cash request retrieved successfully',
            data: cashRequest
        });
    } catch (error) {
        console.error('Error in getCashRequestById:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to retrieve cash request',
            error: error.message
        });
    }
};

/**
 * Create a new cash request
 * @route POST /api/v1/cash-requests
 * @body {string} technician_id - Technician ID (required)
 * @body {string} issue_id - Issue ID (required)
 * @body {number} amount - Amount requested (required, must be > 0)
 * @body {string} description - Description of expense (required)
 */
export const createCashRequest = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { technician_id, issue_id, amount, description } = req.body;

        const newCashRequest = await CashRequestService.createCashRequest({
            technician_id,
            issue_id,
            amount,
            description
        });

        try {
            // Notify via realtime update that a new cash request has been created for the issue
            issueRealtimeUpdate(issue_id, newCashRequest);
        } catch (err) {
            console.error('issueRealtimeUpdate error after creating cash request:', err);
        }

        res.status(201).json({
            success: true,
            message: 'Petty cash request created successfully',
            data: newCashRequest
        });
    } catch (error) {
        console.error('Error in createCashRequest:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to create petty cash request',
            error: error.message
        });
    }
};

/**
 * Update an existing cash request
 * @route PUT /api/v1/cash-requests/:id
 * @param {string} id - Cash request UUID
 * @body {number} amount - Optional: Updated amount
 * @body {string} description - Optional: Updated description
 * @body {string} status - Optional: Updated status (pending, approved, rejected)
 */
export const updateCashRequest = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const updateData = {};

        // Only include fields that are provided
        if (req.body.amount !== undefined) {
            updateData.amount = req.body.amount;
        }
        if (req.body.description !== undefined) {
            updateData.description = req.body.description;
        }
        if (req.body.status !== undefined) {
            updateData.status = req.body.status;
        }

        const updatedCashRequest = await CashRequestService.updateCashRequest(id, updateData);

        try {
            // Notify via realtime update that the cash request has been updated
            issueRealtimeUpdate(updatedCashRequest.issue_id, updatedCashRequest);
        } catch (err) {
            console.error('issueRealtimeUpdate error after updating cash request:', err);
        }

        if (!updatedCashRequest) {
            return res.status(404).json({
                success: false,
                message: 'Cash request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cash request updated successfully',
            data: updatedCashRequest
        });
    } catch (error) {
        console.error('Error in updateCashRequest:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to update cash request',
            error: error.message
        });
    }
};

/**
 * Delete a cash request
 * @route DELETE /api/v1/cash-requests/:id
 * @param {string} id - Cash request UUID
 */
export const deleteCashRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await CashRequestService.deleteCashRequest(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Cash request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cash request deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteCashRequest:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to delete cash request',
            error: error.message
        });
    }
};

/**
 * Approve a cash request
 * @route PATCH /api/v1/cash-requests/:id/approve
 * @param {string} id - Cash request UUID
 */
export const approveCashRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const approvedRequest = await CashRequestService.approveCashRequest(id);

        try {
            // Notify via realtime update that the cash request has been approved
            issueRealtimeUpdate(approvedRequest.issue_id, approvedRequest);
        } catch (err) {
            console.error('issueRealtimeUpdate error after approving cash request:', err);
        }

        if (!approvedRequest) {
            return res.status(404).json({
                success: false,
                message: 'Cash request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cash request approved successfully',
            data: approvedRequest
        });
    } catch (error) {
        console.error('Error in approveCashRequest:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to approve cash request',
            error: error.message
        });
    }
};

/**
 * Reject a cash request
 * @route PATCH /api/v1/cash-requests/:id/reject
 * @param {string} id - Cash request UUID
 */
export const rejectCashRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const rejectedRequest = await CashRequestService.rejectCashRequest(id);

        if (!rejectedRequest) {
            return res.status(404).json({
                success: false,
                message: 'Cash request not found'
            });
        }

        try {
            // Notify via realtime update that the cash request has been rejected
            issueRealtimeUpdate(rejectedRequest.issue_id, rejectedRequest);
        } catch (err) {
            console.error('issueRealtimeUpdate error after rejecting cash request:', err);
        }

        res.status(200).json({
            success: true,
            message: 'Cash request rejected successfully',
            data: rejectedRequest
        });
    } catch (error) {
        console.error('Error in rejectCashRequest:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to reject cash request',
            error: error.message
        });
    }
};

/**
 * Get statistics for a technician
 * @route GET /api/v1/cash-requests/stats/:technician_id
 * @param {string} technician_id - Technician UUID
 */
export const getTechnicianStats = async (req, res) => {
    try {
        const { technician_id } = req.params;

        const stats = await CashRequestService.getTechnicianStats(technician_id);

        res.status(200).json({
            success: true,
            message: 'Technician statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        console.error('Error in getTechnicianStats:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to retrieve technician statistics',
            error: error.message
        });
    }
};

/**
 * Get cash requests by issue ID
 * @route GET /api/v1/cash-requests/by-issue/:issue_id
 * @param {string} issue_id - Issue ID to filter cash requests
 */
export const getCashRequestsByIssueId = async (req, res) => {
    try {
        const { issue_id } = req.params;

        if (!issue_id) {
            return res.status(400).json({
                success: false,
                message: 'issue_id route parameter is required'
            });
        }

        const cashRequests = await CashRequestService.getAllCashRequests({ issue_id });

        res.status(200).json({
            success: true,
            message: 'Cash requests for issue retrieved successfully',
            count: cashRequests.length,
            data: cashRequests
        });
    } catch (error) {
        console.error('Error in getCashRequestsByIssueId:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to retrieve cash requests for issue',
            error: error.message
        });
    }
};

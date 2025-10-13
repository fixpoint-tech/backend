/**
 * Cash Request Routes
 * Defines all RESTful endpoints for petty cash requests
 */

import express from 'express';
import { body, param } from 'express-validator';
import {
    getAllCashRequests,
    getCashRequestById,
    createCashRequest,
    updateCashRequest,
    deleteCashRequest,
    approveCashRequest,
    rejectCashRequest,
    getTechnicianStats
} from '../controllers/cashRequestController.js';

const router = express.Router();

// Validation middleware
const validateUUID = (fieldName) => {
    return param(fieldName)
        .isUUID()
        .withMessage(`${fieldName} must be a valid UUID`);
};

const createCashRequestValidation = [
    body('technician_id')
        .notEmpty()
        .withMessage('technician_id is required')
        .isUUID()
        .withMessage('technician_id must be a valid UUID'),
    body('ticket_id')
        .notEmpty()
        .withMessage('ticket_id is required')
        .isUUID()
        .withMessage('ticket_id must be a valid UUID'),
    body('amount')
        .notEmpty()
        .withMessage('amount is required')
        .isFloat({ min: 0.01 })
        .withMessage('amount must be a positive number greater than 0'),
    body('description')
        .notEmpty()
        .withMessage('description is required')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('description must be between 10 and 1000 characters')
];

const updateCashRequestValidation = [
    body('amount')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('amount must be a positive number greater than 0'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('description must be between 10 and 1000 characters'),
    body('status')
        .optional()
        .isIn(['pending', 'approved', 'rejected'])
        .withMessage('status must be one of: pending, approved, rejected')
];

/**
 * @route   GET /api/v1/cash-requests
 * @desc    Get all petty cash requests (with optional filtering)
 * @access  Protected (TODO: Add JWT authentication middleware)
 * @query   {string} technician_id - Optional: Filter by technician
 * @query   {string} status - Optional: Filter by status
 * @query   {string} ticket_id - Optional: Filter by ticket
 */
router.get('/', getAllCashRequests);

/**
 * @route   GET /api/v1/cash-requests/stats/:technician_id
 * @desc    Get statistics for a specific technician
 * @access  Protected (TODO: Add JWT authentication middleware)
 * @param   {string} technician_id - Technician UUID
 */
router.get('/stats/:technician_id', validateUUID('technician_id'), getTechnicianStats);

/**
 * @route   GET /api/v1/cash-requests/:id
 * @desc    Get a specific petty cash request by ID
 * @access  Protected (TODO: Add JWT authentication middleware)
 * @param   {string} id - Cash request UUID
 */
router.get('/:id', validateUUID('id'), getCashRequestById);

/**
 * @route   POST /api/v1/cash-requests
 * @desc    Create a new petty cash request
 * @access  Protected - Technicians only (TODO: Add JWT authentication middleware)
 * @body    {Object} Cash request data (technician_id, ticket_id, amount, description)
 */
router.post('/', createCashRequestValidation, createCashRequest);

/**
 * @route   PUT /api/v1/cash-requests/:id
 * @desc    Update an existing petty cash request
 * @access  Protected - Technicians (own requests) or Executives (TODO: Add JWT authentication)
 * @param   {string} id - Cash request UUID
 * @body    {Object} Updated data (amount, description, status)
 */
router.put('/:id', validateUUID('id'), updateCashRequestValidation, updateCashRequest);

/**
 * @route   DELETE /api/v1/cash-requests/:id
 * @desc    Delete a petty cash request
 * @access  Protected - Technicians (own requests) or Admins (TODO: Add JWT authentication)
 * @param   {string} id - Cash request UUID
 */
router.delete('/:id', validateUUID('id'), deleteCashRequest);

/**
 * @route   PATCH /api/v1/cash-requests/:id/approve
 * @desc    Approve a petty cash request
 * @access  Protected - Maintenance Executives or Admins only (TODO: Add JWT + role-based middleware)
 * @param   {string} id - Cash request UUID
 */
router.patch('/:id/approve', validateUUID('id'), approveCashRequest);

/**
 * @route   PATCH /api/v1/cash-requests/:id/reject
 * @desc    Reject a petty cash request
 * @access  Protected - Maintenance Executives or Admins only (TODO: Add JWT + role-based middleware)
 * @param   {string} id - Cash request UUID
 */
router.patch('/:id/reject', validateUUID('id'), rejectCashRequest);

export default router;

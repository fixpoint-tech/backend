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
    getTechnicianStats,
    getCashRequestsByTicketId
} from '../controllers/cashRequestController.js';

const router = express.Router();

// Validation middleware
const validateUUID = (fieldName) => {
    return param(fieldName)
        .isUUID()
        .withMessage(`${fieldName} must be a valid UUID`);
};

const validateId = (fieldName) => {
    return param(fieldName)
        .isInt({ min: 1 })
        .withMessage(`${fieldName} must be a valid positive integer`);
};

const createCashRequestValidation = [
    body('technician_id')
        .notEmpty()
        .withMessage('technician_id is required')
        .isInt({ min: 1 })
        .withMessage('technician_id must be a valid positive integer'),
    body('ticket_id')
        .notEmpty()
        .withMessage('ticket_id is required')
        .isInt({ min: 1 })
        .withMessage('ticket_id must be a valid positive integer'),
    body('amount')
        .notEmpty()
        .withMessage('amount is required')
        .isFloat({ min: 0.01 })
        .withMessage('amount must be a positive number greater than 0'),
    body('description')
        .notEmpty()
        .withMessage('description is required')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('description must be between 10 and 5000 characters')
];

const updateCashRequestValidation = [
    body('amount')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('amount must be a positive number greater than 0'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('description must be between 10 and 5000 characters'),
    body('status')
        .optional()
        .isIn(['pending', 'approved', 'rejected'])
        .withMessage('status must be one of: pending, approved, rejected')
];

router.get('/', getAllCashRequests);
router.get('/by-ticket/:ticket_id', validateId('ticket_id'), getCashRequestsByTicketId);
router.get('/stats/:technician_id', validateId('technician_id'), getTechnicianStats);
router.get('/:id', validateUUID('id'), getCashRequestById);
router.post('/', createCashRequestValidation, createCashRequest);
router.put('/:id', validateUUID('id'), updateCashRequestValidation, updateCashRequest);
router.delete('/:id', validateUUID('id'), deleteCashRequest);
router.patch('/:id/approve', validateUUID('id'), approveCashRequest);
router.patch('/:id/reject', validateUUID('id'), rejectCashRequest);

export default router;

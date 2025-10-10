/**
 * User Routes
 * Defines all API endpoints for user management
 */

import express from 'express';
import UserController from '../controllers/userController.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateUserFilters,
  sanitizeUserInput
} from '../middleware/userValidation.js';

const router = express.Router();

// ============================================
// GENERAL USER ENDPOINTS
// ============================================

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (Admin only - add auth middleware later)
 * @body    { name, email, password, role, phone, branch_id, employee_id, skills, etc. }
 */
router.post('/', sanitizeUserInput, validateCreateUser, UserController.createUser);

/**
 * @route   GET /api/users
 * @desc    Get all users with optional filters
 * @access  Private
 * @query   ?role=technician&status=active&branch_id=1&availability=available
 */
router.get('/', validateUserFilters, UserController.getAllUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (count by role)
 * @access  Private (Admin/Executive)
 */
router.get('/stats', UserController.getUserStats);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', validateUserId, UserController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details
 * @access  Private (Admin only - add auth middleware later)
 */
router.put('/:id', validateUserId, sanitizeUserInput, validateUpdateUser, UserController.updateUser);

/**
 * @route   PATCH /api/users/:id/profile
 * @desc    Update user profile (for self-update)
 * @access  Private (Self or Admin)
 */
router.patch('/:id/profile', validateUserId, sanitizeUserInput, UserController.updateProfile);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', validateUserId, UserController.deleteUser);

// ============================================
// TECHNICIAN-SPECIFIC ENDPOINTS
// ============================================

/**
 * @route   GET /api/users/technicians/all
 * @desc    Get all technicians
 * @access  Private
 */
router.get('/technicians/all', UserController.getAllTechnicians);

/**
 * @route   GET /api/users/technicians/available
 * @desc    Get available technicians for assignment
 * @access  Private
 * @query   ?branch_id=1&skills=electrical,plumbing
 */
router.get('/technicians/available', UserController.getAvailableTechnicians);

// ============================================
// BRANCH MANAGER-SPECIFIC ENDPOINTS
// ============================================

/**
 * @route   GET /api/users/branch-managers/all
 * @desc    Get all branch managers
 * @access  Private
 */
router.get('/branch-managers/all', UserController.getAllBranchManagers);

// ============================================
// MAINTENANCE EXECUTIVE-SPECIFIC ENDPOINTS
// ============================================

/**
 * @route   GET /api/users/maintenance-executives/all
 * @desc    Get all maintenance executives
 * @access  Private
 */
router.get('/maintenance-executives/all', UserController.getAllMaintenanceExecutives);

export default router;

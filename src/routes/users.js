import express from 'express';
import technicianController from '../controllers/technicianController.js';
import branchManagerController from '../controllers/branchManagerController.js';
import maintenanceExecutiveController from '../controllers/maintenanceExecutiveController.js';
import userService from '../services/userService.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId
} from '../middleware/validation.js';

const router = express.Router();

// ============================================
// TECHNICIAN ROUTES
// ============================================

/**
 * @route   POST /api/v1/users/technicians
 * @desc    Create a new technician
 * @access  Public (no auth for now)
 */
router.post('/technicians', validateCreateUser, technicianController.createTechnician);

/**
 * @route   GET /api/v1/users/technicians
 * @desc    Get all technicians
 * @access  Public
 */
router.get('/technicians', technicianController.getAllTechnicians);

/**
 * @route   GET /api/v1/users/technicians/:id
 * @desc    Get technician by ID
 * @access  Public
 */
router.get('/technicians/:id', validateUserId, technicianController.getTechnicianById);

/**
 * @route   PUT /api/v1/users/technicians/:id
 * @desc    Update technician
 * @access  Public
 */
router.put(
  '/technicians/:id',
  validateUserId,
  validateUpdateUser,
  technicianController.updateTechnician
);

/**
 * @route   DELETE /api/v1/users/technicians/:id
 * @desc    Delete technician (soft delete)
 * @access  Public
 */
router.delete('/technicians/:id', validateUserId, technicianController.deleteTechnician);

// ============================================
// BRANCH MANAGER ROUTES
// ============================================

/**
 * @route   POST /api/v1/users/branch-managers
 * @desc    Create a new branch manager
 * @access  Public
 */
router.post('/branch-managers', validateCreateUser, branchManagerController.createBranchManager);

/**
 * @route   GET /api/v1/users/branch-managers
 * @desc    Get all branch managers
 * @access  Public
 */
router.get('/branch-managers', branchManagerController.getAllBranchManagers);

/**
 * @route   GET /api/v1/users/branch-managers/:id
 * @desc    Get branch manager by ID
 * @access  Public
 */
router.get('/branch-managers/:id', validateUserId, branchManagerController.getBranchManagerById);

/**
 * @route   PUT /api/v1/users/branch-managers/:id
 * @desc    Update branch manager
 * @access  Public
 */
router.put(
  '/branch-managers/:id',
  validateUserId,
  validateUpdateUser,
  branchManagerController.updateBranchManager
);

/**
 * @route   DELETE /api/v1/users/branch-managers/:id
 * @desc    Delete branch manager (soft delete)
 * @access  Public
 */
router.delete('/branch-managers/:id', validateUserId, branchManagerController.deleteBranchManager);

// ============================================
// MAINTENANCE EXECUTIVE ROUTES
// ============================================

/**
 * @route   POST /api/v1/users/maintenance-executives
 * @desc    Create a new maintenance executive
 * @access  Public
 */
router.post(
  '/maintenance-executives',
  validateCreateUser,
  maintenanceExecutiveController.createMaintenanceExecutive
);

/**
 * @route   GET /api/v1/users/maintenance-executives
 * @desc    Get all maintenance executives
 * @access  Public
 */
router.get('/maintenance-executives', maintenanceExecutiveController.getAllMaintenanceExecutives);

/**
 * @route   GET /api/v1/users/maintenance-executives/:id
 * @desc    Get maintenance executive by ID
 * @access  Public
 */
router.get(
  '/maintenance-executives/:id',
  validateUserId,
  maintenanceExecutiveController.getMaintenanceExecutiveById
);

/**
 * @route   PUT /api/v1/users/maintenance-executives/:id
 * @desc    Update maintenance executive
 * @access  Public
 */
router.put(
  '/maintenance-executives/:id',
  validateUserId,
  validateUpdateUser,
  maintenanceExecutiveController.updateMaintenanceExecutive
);

/**
 * @route   DELETE /api/v1/users/maintenance-executives/:id
 * @desc    Delete maintenance executive (soft delete)
 * @access  Public
 */
router.delete(
  '/maintenance-executives/:id',
  validateUserId,
  maintenanceExecutiveController.deleteMaintenanceExecutive
);

// ============================================
// GENERAL USER ROUTES (Optional)
// ============================================

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (all roles)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get any user by ID
 * @access  Public
 */
router.get('/:id', validateUserId, async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

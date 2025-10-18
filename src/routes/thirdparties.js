import express from 'express';
import thirdPartiesController from '../controllers/thirdPartiesController.js';
import {
    validateCreateThirdParty,
    validateUpdateThirdParty,
    validateThirdPartyId
} from '../middleware/validation.js';

const router = express.Router();

// ============================================
// THIRD PARTY ROUTES
// ============================================

/**
 * @route   POST /api/v1/thirdparties
 * @desc    Create a new third party
 * @access  Public (no auth for now)
 * @body    { organization, email, location?, phone?, worktype?, profilePicture? }
 */
router.post('/', validateCreateThirdParty, thirdPartiesController.createThirdParty);

/**
 * @route   GET /api/v1/thirdparties
 * @desc    Get all third parties with optional filters
 * @access  Public
 * @query   ?worktype=value&location=value&search=value
 */
router.get('/', thirdPartiesController.getAllThirdParties);

/**
 * @route   GET /api/v1/thirdparties/:id
 * @desc    Get third party by ID
 * @access  Public
 */
router.get('/:id', validateThirdPartyId, thirdPartiesController.getThirdPartyById);

/**
 * @route   PUT /api/v1/thirdparties/:id
 * @desc    Update third party by ID
 * @access  Public
 */
router.put(
    '/:id',
    validateThirdPartyId,
    validateUpdateThirdParty,
    thirdPartiesController.updateThirdParty
);

/**
 * @route   DELETE /api/v1/thirdparties/:id
 * @desc    Delete third party by ID (hard delete)
 * @access  Public
 */
router.delete('/:id', validateThirdPartyId, thirdPartiesController.deleteThirdParty);

// ============================================
// SPECIALIZED ROUTES FOR FILTERING
// ============================================

/**
 * @route   GET /api/v1/thirdparties/worktype/:worktype
 * @desc    Get third parties by work type
 * @access  Public
 */
router.get('/worktype/:worktype', thirdPartiesController.getThirdPartiesByWorkType);

/**
 * @route   GET /api/v1/thirdparties/location/:location
 * @desc    Get third parties by location
 * @access  Public
 */
router.get('/location/:location', thirdPartiesController.getThirdPartiesByLocation);

export default router;
import express from 'express';
import {
  getOverallHealth,
  getDatabaseHealth,
  getStorageHealth,
  getReadinessCheck,
  getLivenessCheck
} from '../controllers/healthController.js';

const router = express.Router();

router.get('/', getOverallHealth);
router.get('/database', getDatabaseHealth);
router.get('/storage', getStorageHealth);
router.get('/ready', getReadinessCheck);
router.get('/live', getLivenessCheck);

export default router;
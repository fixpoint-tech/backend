import express from 'express';
import { dataDrivenAHP } from '../controllers/ahpController.js';

const router = express.Router();

router.post('/', dataDrivenAHP)

export default router;
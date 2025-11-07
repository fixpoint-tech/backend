import express from 'express';
import { dataDrivenAHP } from '../controllers/ahpController.js';

const ahpRouter = express.Router();

ahpRouter.post('/ahp', dataDrivenAHP)

export default ahpRouter;
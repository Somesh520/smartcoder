import express from 'express';
import {
    getProblems,
    getProblemDetails,
    runController,
    submitController,
    pollController
} from '../controllers/problemController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // Apply to all routes in this file

router.get('/problems', getProblems);
router.get('/problem/:id', getProblemDetails);
router.post('/run', runController);
router.post('/submit', submitController);
router.post('/poll/:id', pollController);

export default router;

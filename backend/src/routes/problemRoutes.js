import express from 'express';
import {
    getProblems,
    getProblemDetails,
    runController,
    submitController,
    pollController
} from '../controllers/problemController.js';

const router = express.Router();

router.get('/problems', getProblems);
router.get('/problem/:id', getProblemDetails);
router.post('/run', runController);
router.post('/submit', submitController);
router.post('/poll/:id', pollController);

export default router;

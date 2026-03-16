import express from 'express';
import { registerTester, getTesterStatus } from '../controllers/testerController.js';

const router = express.Router();

router.post('/register', registerTester);
router.get('/status', getTesterStatus);

export default router;

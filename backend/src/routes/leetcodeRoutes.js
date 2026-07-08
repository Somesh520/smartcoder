import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
    getMe,
    searchProblems,
    getDaily,
    getSubmissions,
    getCalendar,
    getContest,
    getSkills,
    getUser,
    getSolved
} from '../controllers/leetcodeController.js';

const router = express.Router();
router.use(verifyToken); // Protect all LeetCode proxy routes

router.post('/me', getMe);
router.get('/search', searchProblems);
router.get('/daily', getDaily);
router.get('/submissions', getSubmissions);
router.get('/submissions/:username', getSubmissions);
router.get('/calendar', getCalendar);
router.get('/calendar/:username', getCalendar);
router.get('/contest', getContest);
router.get('/contest/:username', getContest);
router.get('/skills', getSkills);
router.get('/skills/:username', getSkills);
router.get('/', getUser);
router.get('/:username', getUser);
router.post('/solved', getSolved);

export default router;

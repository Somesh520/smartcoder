import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getReviews, addReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', verifyToken, addReview);

export default router;

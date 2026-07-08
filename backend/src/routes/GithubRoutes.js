import express from 'express'
import { githubuser, githubrepo, saveDsaRepo, removedsarepo, commitToGithub } from '../controllers/Github.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/user', githubuser);
router.get('/repo', githubrepo);
router.post('/save-dsa-repo', verifyToken, saveDsaRepo);
router.post('/remove', verifyToken, removedsarepo);
router.post('/commit', verifyToken, commitToGithub);

export default router;

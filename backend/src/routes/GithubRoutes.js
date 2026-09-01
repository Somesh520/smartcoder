import express from 'express'
import { githubuser, githubrepo, saveDsaRepo, removedsarepo, commitToGithub, disconnectGithub } from '../controllers/Github.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(verifyToken);

router.get('/user', githubuser);
router.get('/repo', githubrepo);
router.post('/save-dsa-repo', saveDsaRepo);
router.post('/remove', removedsarepo);
router.post('/disconnect', disconnectGithub);
router.post('/commit', commitToGithub);

export default router;

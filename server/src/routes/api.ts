import { Router } from 'express';
import { createAnonymousSession, login, logout, me, register } from '../controllers/authController.js';
import { startTest, submitTest } from '../controllers/testController.js';
import { getHistory, getResult } from '../controllers/resultController.js';

const router = Router();

router.post('/auth/anonymous', createAnonymousSession);
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', me);
router.post('/auth/logout', logout);

router.get('/test/start', startTest);
router.post('/test/:attemptId/submit', submitTest);

router.get('/results/history', getHistory);
router.get('/results/:attemptId', getResult);

export default router;

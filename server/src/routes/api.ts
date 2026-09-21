import {
  adminAccounts,
  adminCreateTeacher,
  adminCreateUser,
  adminDeleteTeacher,
  adminDeleteUser,
  adminUpdateTeacher,
  adminUpdateUser,
} from '../controllers/adminController.js';
import { Router } from 'express';
import { createAnonymousSession, login, logout, me, register } from '../controllers/authController.js';
import { getHistory, getResult } from '../controllers/resultController.js';
import {
  bootstrapTeacher,
  clearTeacherAttempts,
  deleteTeacherAttempt,
  listTeachers,
  teacherAttemptDetail,
  teacherBootstrapStatus,
  teacherDashboard,
  teacherLogin,
  teacherLogout,
  teacherMe,
  updateTeacherAttempt,
} from '../controllers/teacherController.js';
import { startTest, submitTest } from '../controllers/testController.js';
import { getListeningAudio } from '../controllers/ttsController.js';

const router = Router();

router.post('/auth/anonymous', createAnonymousSession);
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', me);
router.post('/auth/logout', logout);

router.get('/teachers', listTeachers);

router.get('/teacher/auth/bootstrap-status', teacherBootstrapStatus);
router.post('/teacher/auth/bootstrap', bootstrapTeacher);
router.post('/teacher/auth/login', teacherLogin);
router.get('/teacher/auth/me', teacherMe);
router.post('/teacher/auth/logout', teacherLogout);
router.get('/teacher/dashboard', teacherDashboard);
router.delete('/teacher/attempts', clearTeacherAttempts);
router.get('/teacher/attempts/:attemptId', teacherAttemptDetail);
router.patch('/teacher/attempts/:attemptId', updateTeacherAttempt);
router.delete('/teacher/attempts/:attemptId', deleteTeacherAttempt);

router.get('/teacher/admin/accounts', adminAccounts);
router.post('/teacher/admin/users', adminCreateUser);
router.patch('/teacher/admin/users/:userId', adminUpdateUser);
router.delete('/teacher/admin/users/:userId', adminDeleteUser);
router.post('/teacher/admin/teachers', adminCreateTeacher);
router.patch('/teacher/admin/teachers/:teacherId', adminUpdateTeacher);
router.delete('/teacher/admin/teachers/:teacherId', adminDeleteTeacher);

router.post('/test/start', startTest);
router.post('/test/:attemptId/submit', submitTest);
router.get('/tts/:questionId', getListeningAudio);

router.get('/results/history', getHistory);
router.get('/results/:attemptId', getResult);

export default router;

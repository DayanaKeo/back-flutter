const express = require('express');
const router = express.Router();
const userController = require('../controller/user/userController');
const authController = require('../controller/user/authController');


router.post('/register', userController.create);
router.get('/getUser', userController.findAll);
router.get('/info-user/:userId', userController.findById);
// router.post('/login', userController.login);
router.post('/send-verification-email', userController.sendVerificationEmail);
router.get('/verify/:token', userController.verifyEmail);
router.post('/forgot-password', userController.forgetPassword);
router.get('/reset-password/:token', userController.resetPassword);
router.post('/update-password', userController.updatePassword);

router.post('/login', authController.login);
router.post('/verify-2fa-code', authController.verifyTokenWithUserId);
router.get('/verify-2fa', authController.showVerify2faPage);
router.get('/activate-2fa', authController.sendActivate2fa);




module.exports = router;
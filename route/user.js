const express = require('express');
const router = express.Router();
const userController = require('../controller/user/user');


router.post('/register', userController.create);
router.get('/getUser', userController.findAll);
router.post('/auth', userController.auth);
router.post('/send-verification-email', userController.sendVerificationEmail);
router.get('/verify/:token', userController.verifyEmail);
router.post('/forgot-password', userController.forgetPassword);
router.get('/reset-password/:token', userController.resetPassword);
router.post('/update-password', userController.updatePassword);

module.exports = router;
const express = require('express');
const router = express.Router();
const userController = require('../controller/user');


router.post('/register', userController.create);
router.get('/getUser', userController.findAll);
router.post('/auth', userController.auth);
router.post('/send-verification-email', userController.sendVerificationEmail);
router.get('/verify/:token', userController.verifyEmail);
module.exports = router;
const express = require('express');
const router = express.Router();
const twoFactorController = require('../controller/user/two-factor');

router.post('/generateSecret', twoFactorController.generateSecret);
router.post('/generateToken', twoFactorController.generateToken);
router.post('/verifyToken', twoFactorController.verifyToken);
router.get('/activate-2fa', twoFactorController.sendActivate2fa);
router.get('/verify-2fa', twoFactorController.showVerify2faPage);
router.post('/verify-2fa-code', twoFactorController.verifyTokenWithUserId);
module.exports = router;

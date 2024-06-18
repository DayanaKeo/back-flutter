const express = require('express');
const router = express.Router();
const twoFactorController = require('../controller/user/two-factor');

router.post('/generateSecret', twoFactorController.generateSecret);
router.post('/generateToken', twoFactorController.generateToken);
router.post('/verifyToken', twoFactorController.verifyToken);

module.exports = router;

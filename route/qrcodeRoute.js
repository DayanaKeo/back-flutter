const express = require('express');
const router = express.Router();

const qrcodeController = require('../controller/qrcode/generateController');

router.get('/generate/:child_id/:contact_id/:user_id', qrcodeController.generate);
router.get('/contact_info/:child_id', qrcodeController.getChildContactInfo);
router.post('/create', qrcodeController.create);

module.exports = router;
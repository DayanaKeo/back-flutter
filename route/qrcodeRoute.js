const express = require('express');
const router = express.Router();

const qrcodeController = require('../controller/qrcode/generateController');

router.get('/generate_qr/:child_id', qrcodeController.generate);
router.get('/contact_info/:child_id', qrcodeController.getChildContactInfo);

module.exports = router;
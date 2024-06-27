const express = require('express');
const router = express.Router();

const contactController = require('../controller/contact_urg/contactController')

router.post('/ajouter-un-contact', contactController.create);

module.exports = router;
const express = require('express');
const router = express.Router();

const tuteurController = require('../controller/tuteur/tuteurController');

router.post('/ajout-tuteur', tuteurController.create);

module.exports = router;
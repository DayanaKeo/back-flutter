const express = require('express');
const router = express.Router();
const userController = require('../controller/user');

router.post('/postUser', userController.create);

module.exports = router;
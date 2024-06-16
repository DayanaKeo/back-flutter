const express = require('express');
const router = express.Router();
const roleController = require('../controller/role.controller');

router.get('/getRole', roleController.findAll);


module.exports = router;
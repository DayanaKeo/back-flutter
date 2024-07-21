const express = require('express')
const router = express.Router();

const Article = require('../../model/article.mongo')
const articleController = require('../../controller/boutique/article.controller')


router.post('/articles', articleController.create );
router.get('/tous-les-articles', articleController.findAll);

module.exports = router;


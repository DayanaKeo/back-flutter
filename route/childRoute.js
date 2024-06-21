const express = require('express');
const router = express.Router();

const childController = require('../controller/child/childController')

router.post('/inscrire-mon-enfant', childController.create);
router.get('/info-enfant/:id', childController.findById);
router.get('/listes-des-enfants', childController.findAll);
router.put('/modification-mon-enfant/:id', childController.updateChildById);
router.delete('/supprimer/:id', childController.deleteChildById);


module.exports = router;
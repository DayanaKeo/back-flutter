const express = require('express');
const router = express.Router();

const childController = require('../controller/child/childController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/inscrire-mon-enfant/:userId', authenticateJWT, childController.create);
// router.post('/inscrire-mon-enfant', childController.createChildForUser);
router.get('/info-enfant/:id', childController.findById);
router.get('/listes-des-enfants', childController.findAll);
router.get('/enfants-par-utilisateur/:userId', childController.getChildrenByUserId);
router.put('/modification-mon-enfant/:id', authenticateJWT, childController.updateChildById);
router.delete('/supprimer/:id', authenticateJWT, childController.deleteChildById);

router.get('/mes-enfants/:userId', childController.getChildrenByContactUrg);
router.get('/mon-carnet-d-enfant/:userId', childController.getChildrenByTuteurUser);

module.exports = router;
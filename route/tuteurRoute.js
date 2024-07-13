const express = require('express');
const router = express.Router();

const tuteurController = require('../controller/tuteur/tuteurController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/ajout-tuteur', tuteurController.create);
router.get('/get-tuteur-by-user/:id', tuteurController.findTuteurByUserId);
router.get('/get-tuteur-id/:id', tuteurController.findById);
router.get('/liste-enfant/:id', tuteurController.getChildrenByTuteurUserId);
router.put('/editer-tuteur', authenticateJWT, tuteurController.updateTuteur);

module.exports = router;
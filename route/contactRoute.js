const express = require('express');
const router = express.Router();

const contactController = require('../controller/contact_urg/contactController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/ajouter-un-contact/:userId', authenticateJWT, contactController.create);
router.get('/:userId/contacts', contactController.getContactByUserId);
router.put('/editer-contact/:id', authenticateJWT, contactController.updateContactById)
router.delete('/supprimer/:id', authenticateJWT, contactController.deleteContactById);
module.exports = router;
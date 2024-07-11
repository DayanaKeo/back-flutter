const Joi = require('joi');
const Contact = require('../../model/contactModel');


// Schéma de validation pour un enfant
const contactUrgSchema = Joi.object({
    prenom: Joi.string().max(255).required(),
    nom: Joi.string().max(255).required(),
    tel: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    lien_affilie: Joi.string().max(100).required(),
    child_id: Joi.number().integer().optional(),
    user_id: Joi.number().integer().optional()
});

// CREATE - Ajouter un nouveau contact d'urgence
exports.create = async (req, res) => {
  const { userId } = req.params;
  const { prenom, nom, tel, lien_affilie } = req.body;

  // Validation des données d'entrée
  const { error } = contactUrgSchema.validate({ prenom, nom, tel, lien_affilie, user_id: userId });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newContact = { prenom, nom, tel, lien_affilie, user_id: userId };
    const data = await Contact.create(newContact);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création du contact d\'urgence",
      error: err.message
    });
  }
};

exports.createContactForUser = async (req, res) => {
  const { prenom, nom, tel, lien_affilie, user_id, child_id } = req.body;

  // Validation des données d'entrée
  const { error } = contactUrgSchema.validate({ prenom, nom, tel, user_id, tuteur_id });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newContact = { prenom, nom, age, user_id, child_id };
    const data = await Child.createChildForUser(newContact);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création du contact d\'urgence",
      error: err.message,
    });
  }
}

exports.getContactByUserId = async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const contact = await Contact.getContactByUserId(userId);
    return res.status(200).send(contact);
  } catch (error) {
    if (error.kind === "not_found") {
      return res.status(404).send({
        message: `Erreur lors de la récupération des contacts d\'urgences: ${userId}`
      });
    } else {
      return res.status(500).send({
        message: `Erreur serveur`
      });
    }
  }
};

const updateContact = Joi.object({
  prenom: Joi.string().min(2).max(50).optional(),
  nom: Joi.string().min(2).max(50).optional(),
  tel: Joi.number().integer().min(0).optional(),
  lien_affilie: Joi.string().min(2).max(50).optional()
}).or('prenom', 'nom', 'tel', 'lien_affilie');

exports.updateContactById = async (req, res) => {
  const { id } = req.params;
  const { prenom, nom, tel, lien_affilie } = req.body;

  // Validation des données d'entrée
  const { error } = updateContact.validate({ prenom, nom, tel, lien_affilie });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Construire l'objet des données à mettre à jour
  const updatedContact = {};
  if (prenom) updatedContact.prenom = prenom;
  if (nom) updatedContact.nom = nom;
  if (tel) updatedContact.tel = tel;
  if (lien_affilie) updatedContact.lien_affilie = lien_affilie;
  
  try {
    const updatedData = await Contact.updateById(id, updatedContact);
    res.status(200).json({
      message: 'Contact mis à jour avec succès',
      data: updatedData
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de votre contact:", err);
    if (err.kind === "not_found") {
      return res.status(404).json({
        message: `Contact non trouvé avec l'id ${id}`
      });
    } else {
      return res.status(500).json({
        message: `Erreur lors de la mise à jour du contact avec l'id ${id}`,
        error: err.message
      });
    }
  }
};

exports.deleteContactById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Contact.deleteById(id);
    res.status(200).json({ message: 'Contact supprimé avec succès' });
  } catch (err) {
    console.error("Erreur lors de la suppression du contact:", err);
    if (err.kind === "not_found") {
      res.status(404).json({ message: `Contact non trouvé avec l'id ${id}` });
    } else {
      res.status(500).json({
        message: `Erreur lors de la suppression du contact avec l'id ${id}`,
        error: err.message
      });
    }
  }
};
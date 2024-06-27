const Joi = require('joi');
const Contact = require('../../model/contactModel');


// Schéma de validation pour un enfant
const contactUrgSchema = Joi.object({
    tuteur_id: Joi.number().integer().required(),
    prenom: Joi.string().max(255).required(),
    nom: Joi.string().max(255).required(),
    tel: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    lien_affilie: Joi.string().max(100).required()
});

// CREATE - Ajouter un nouveau contact d'urgence
exports.create = async (req, res) => {
  const { error, value } = contactUrgSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { tuteur_id, prenom, nom, tel, lien_affilie } = value;

  const newContact = new Contact({ tuteur_id, prenom, nom, tel, lien_affilie });

  Contact.create(newContact)
    .then((result) => {
      res.status(201).json({ message: "Contact d'urgence ajouté avec succès", id: result.id });
    })
    .catch((error) => {
      res.status(500).json({ error: "Erreur lors de la création du contact d'urgence", details: error });
    });
};
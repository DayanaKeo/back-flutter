const Joi = require('joi');
const Child = require('../../model/childModel');

// Schéma de validation pour un enfant
const child = Joi.object({
  prenom: Joi.string().min(2).max(50).required(),
  nom: Joi.string().min(2).max(50).required(),
  age: Joi.number().integer().min(0).required(),
  user_id: Joi.number().integer().required(),
  // tuteur_id: Joi.number().integer().required()
});

exports.create = async (req, res) => {
  const { userId } = req.params;
  const { prenom, nom, age } = req.body;

  // Validation des données d'entrée
  const { error } = child.validate({ prenom, nom, age, user_id: userId });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newChild = { prenom, nom, age, user_id: userId };
    const data = await Child.create(newChild);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création de l'enfant",
      error: err.message
    });
  }
};

exports.createChildForUser = async (req, res) => {
  const { prenom, nom, age, user_id, tuteur_id } = req.body;

  // Validation des données d'entrée
  const { error } = childSchema.validate({ prenom, nom, age, user_id, tuteur_id });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newChild = { prenom, nom, age, user_id, tuteur_id };
    const data = await Child.createChildForUser(newChild);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création de l'enfant",
      error: err.message,
    });
  }
}

exports.findById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const child = await Child.findById(id);
      return res.status(200).send(child);
    } catch (error) {
      if (error.kind === "not_found") {
        return res.status(404).send({
          message: `Enfant non trouvé avec l'id ${id}`
        });
      } else {
        return res.status(500).send({
          message: `Erreur lors de la récupération de l'enfant avec l'id ${id}`
        });
      }
    }
};

exports.findAll = (req, res) => {
    Child.findAll((err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || 'Une erreur s\'est produite lors de la récupération des enfants'
        });
      } else {
        res.send(data);
      }
    });
};

exports.getChildrenByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const children = await Child.getChildrenByUserId(userId);
    if (children.length === 0) {
      return res.status(404).send({
        message: `Aucun enfant trouvé pour l'utilisateur avec l'ID: ${userId}`
      });
    }
    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({
      message: `Erreur lors de la récupération des enfants pour l'utilisateur avec l'ID: ${userId}`,
      error: error.message
    });
  }
};

exports.getChildrenByContactUrg = async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const child = await Child.getChildrenByContactUrg(userId);
    return res.status(200).send(child);
  } catch (error) {
    if (error.kind === "not_found") {
      return res.status(404).send({
        message: `Erreur lors de la récupération des enfants pour ce contact d\'urgence: ${userId}`
      });
    } else {
      return res.status(500).send({
        message: `Erreur serveur`
      });
    }
  }
};

// exports.getChildrenByTuteurUser = async (req, res) => {
//   const userId = req.params.userId;
//   const tuteurId = req.params.tuteurId;
  
//   try {
//     const children = await Child.getChildrenByTuteurUser(userId, tuteurId);
//     return res.status(200).send(children);
//   } catch (error) {
//     if (error.kind === "not_found") {
//       return res.status(404).send({
//         message: `Erreur lors de la récupération des enfants pour l'utilisateur: ${userId} et tuteur: ${tuteurId}`
//       });
//     } else {
//       return res.status(500).send({
//         message: `Erreur serveur`
//       });
//     }
//   }
// };

exports.getChildrenByTuteurUser = async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const children = await Child.getChildrenByTuteurUser(userId);
    if (children.length === 0) {
      return res.status(404).send({
        message: `Aucun enfant trouvé pour l'utilisateur: ${userId}`
      });
    }
    return res.status(200).send(children);
  } catch (error) {
    return res.status(500).send({
      message: `Erreur serveur: ${error.message}`
    });
  }
};

// Schéma de validation pour la mise à jour partielle d'un enfant
const updateChild = Joi.object({
  prenom: Joi.string().min(2).max(50).optional(),
  nom: Joi.string().min(2).max(50).optional(),
  age: Joi.number().integer().min(0).optional()
}).or('prenom', 'nom', 'age');

exports.updateChildById = async (req, res) => {
  const { id } = req.params;
  const { prenom, nom, age } = req.body;

  // Validation des données d'entrée
  const { error } = updateChild.validate({ prenom, nom, age });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Construire l'objet des données à mettre à jour
  const updatedChild = {};
  if (prenom) updatedChild.prenom = prenom;
  if (nom) updatedChild.nom = nom;
  if (age) updatedChild.age = age;

  try {
    const updatedData = await Child.updateById(id, updatedChild);
    res.status(200).json({
      message: 'Enfant mis à jour avec succès',
      data: updatedData
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'enfant:", err);
    if (err.kind === "not_found") {
      return res.status(404).json({
        message: `Enfant non trouvé avec l'id ${id}`
      });
    } else {
      return res.status(500).json({
        message: `Erreur lors de la mise à jour de l'enfant avec l'id ${id}`,
        error: err.message
      });
    }
  }
};

exports.deleteChildById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Child.deleteById(id);
    res.status(200).json({ message: 'Enfant supprimé avec succès' });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'enfant:", err);
    if (err.kind === "not_found") {
      res.status(404).json({ message: `Enfant non trouvé avec l'id ${id}` });
    } else {
      res.status(500).json({
        message: `Erreur lors de la suppression de l'enfant avec l'id ${id}`,
        error: err.message
      });
    }
  }
};

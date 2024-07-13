const Joi = require('joi');
const Tuteur = require('../../model/tuteurModel');

// Schéma de validation pour le tuteur
const tuteur = Joi.object({
  user_id: Joi.number().integer().required(),
  tel: Joi.string().min(10).required(),
  lien_affilie: Joi.string().min(2).max(50).required(),
});

exports.create = async (req, res) => {
  const { tel, lien_affilie } = req.body;
  // Validation des données d'entrée
  const { error } = tuteur.validate({ tel, lien_affilie });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newTuteur = { tel, lien_affilie };
    const data = await Tuteur.create(newTuteur);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création du tuteur",
      error: err.message
    });
  }
};

exports.findById = async (req, res) => {
  const { id } = req.params;

  try {
   const tuteur = await Tuteur.findById(id);
   return res.status(200).send(tuteur);
  } catch (error) {
    if (error.kind === "not_found") {
      return res.status(404).send({
        message: `Tuteur non trouvé avec l'id ${id}`
      });
    } else {
      return res.status(500).send({
        message: `Erreur lors de la récupération du tuteur avec l'id ${id}`
      });
    }
  }
}

exports.findTuteurByUserId = async (req, res) => {
    const { id } = req.params;
  
    try {
      const tuteur = await Tuteur.findTuteurByUserId(id);
      return res.status(200).send(tuteur);
    } catch (error) {
      if (error.kind === "not_found") {
        return res.status(404).send({
          message: `Tuteur non trouvé avec l'id ${id}`
        });
      } else {
        return res.status(500).send({
          message: `Erreur lors de la récupération du tuteur avec l'id ${id}`
        });
      }
    }
};

exports.getChildrenByTuteurUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const tuteur = await Tuteur.getChildrenByTuteurUserId(id);
    return res.status(200).send(tuteur);
  } catch (error) {
    if (error.kind === "not_found") {
      return res.status(404).send({
        message: `Erreur lors de la récupération des enfants: ${id}`
      });
    } else {
      return res.status(500).send({
        message: `Erreur serveur`
      });
    }
  }
};

// exports.findAll = (req, res) => {
//     Tuteur.findAll((err, data) => {
//       if (err) {
//         res.status(500).send({
//           message: err.message || 'Une erreur s\'est produite lors de la récupération des tuteurs'
//         });
//       } else {
//         res.send(data);
//       }
//     });
// };

// // Schéma de validation pour la mise à jour partielle d'un enfant
// const updateTuteur = Joi.object({
//   tel: Joi.number().integer().min(10).max(10).optional(),
//   nom: Joi.string().min(2).max(50).optional(),
// }).or('tel', 'lien');

// exports.updateTuteur = async (req, res) => {
//   const { id } = req.params;
//   const { tel, lien } = req.body;

//   // Validation des données d'entrée
//   const { error } = updateTuteur.validate({ tel, lien });
//   if (error) {
//     return res.status(400).json({ message: error.details[0].message });
//   }

//   // Construire l'objet des données à mettre à jour
//   const updateTuteur = {};
//   if (tel) updateTuteur.tel = tel;
//   if (lien) updateTuteur.lien = lien;

//   try {
//     const updatedData = await Tuteur.updateById(id, updateTuteur);
//     res.status(200).json({
//       message: 'Tuteur mis à jour avec succès',
//       data: updatedData
//     });
//   } catch (err) {
//     console.error("Erreur lors de la mise à jour du tuteur:", err);
//     if (err.kind === "not_found") {
//       return res.status(404).json({
//         message: `Tuteur non trouvé avec l'id ${id}`
//       });
//     } else {
//       return res.status(500).json({
//         message: `Erreur lors de la mise à jour du tuteur avec l'id ${id}`,
//         error: err.message
//       });
//     }
//   }
// };

exports.updateTuteur = async (req, res) => {
  const { error } = tuteur.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const { user_id, tel, lien_affilie } = req.body;

  try {
    const existingTuteur = await Tuteur.findByUserId(user_id);
    if (!existingTuteur) {
      return res.status(404).send({ message: `Tuteur non trouvé avec l'id utilisateur ${user_id}` });
    }

    const updatedTuteur = {
      tel: tel,
      lien_affilie: lien_affilie
    };

    const data = await Tuteur.updateByUserId(user_id, updatedTuteur);

    res.status(200).send({
      message: 'Tuteur mis à jour avec succès',
      data
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Une erreur s\'est produite lors de la mise à jour du tuteur'
    });
  }
};

// exports.deleteTuteurById = async (req, res) => {
//     const { id } = req.params;
  
//     try {
//       await Child.deleteById(id);
//       res.status(200).json({
//         message: 'Tuteur supprimé avec succès'
//       });
//     } catch (err) {
//       console.error("Erreur lors de la suppression du tuteur:", err);
//       if (err.kind === "not_found") {
//         return res.status(404).json({
//           message: `Tuteur non trouvé avec l'id ${id}`
//         });
//       } else {
//         return res.status(500).json({
//           message: `Erreur lors de la suppression du tuteur avec l'id ${id}`,
//           error: err.message
//         });
//       }
//     }
// };

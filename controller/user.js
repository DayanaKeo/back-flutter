const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

exports.create = (req, res) => {
    if (!req.body.prenom || !req.body.nom || !req.body.email || !req.body.password) {
      res.status(400).send({
        message: 'Veuillez renseigner toutes les données nécessaires'
      });
      return;
    }
  
    const newUser = new User({
      prenom: req.body.prenom,
      nom: req.body.nom,
      email: req.body.email,
      password: req.body.password,
    });
  
    User.create(newUser, (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || 'Une erreur s\'est produite lors de la création de l\'utilisateur'
        });
      else res.send(data);
    });
};

exports.findAll = (req, res) => {
  User.findAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || 'Une erreur s\'est produite lors de la récupération des utilisateurs'
      });
    else res.send(data);
  });
};

//AUTHENTIFICATION 



exports.auth = (req, res) => {
    const { email, password } = req.body;

    User.findByEmail(email, password, (err, user) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        if (user) {
            // Supprimer le mot de passe du résultat avant de le renvoyer
            delete user.password;

            // Générer le token JWT
            const expireIn = 24 * 60 * 60; // 24 heures en secondes
            const token = jwt.sign({ user: user }, SECRET_KEY, { expiresIn: expireIn });

            // Envoyer le token dans l'en-tête de réponse
            res.header('Authorization', 'Bearer ' + token);

            // Renvoyer une réponse réussie avec le token
            return res.status(200).json({ token: token });
        } else {
            // Si l'utilisateur n'est pas trouvé ou que le mot de passe est incorrect
            return res.status(403).json({ message: 'Mauvaises informations d\'identification' });
        }
    });
};

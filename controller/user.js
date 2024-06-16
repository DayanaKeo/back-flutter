const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
require('dotenv').config();

exports.create = async (req, res) => {
  const { prenom, nom, email, password, password2 } = req.body;

  // Vérification que tous les champs nécessaires sont renseignés
  if (!prenom || !nom || !email || !password || !password2) {
    return res.status(400).send({
      message: 'Veuillez renseigner toutes les données nécessaires'
    });
  }

  // Vérification que les mots de passe correspondent
  if (password !== password2) {
    return res.status(400).send({
      message: 'Les mots de passe ne correspondent pas'
    });
  }

  try {
    // Hash du mot de passe avant de l'enregistrer en base de données
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur dans la base de données
    const newUser = new User({
      prenom,
      nom,
      email,
      password: hashedPassword,
      password2: hashedPassword,
      role_id: 1  // Défaut : utilisateur
    });

    User.create(newUser, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: err.message || 'Une erreur s\'est produite lors de la création de l\'utilisateur'
        });
      }

      // Générer un token JWT
      const token = jwt.sign({ id: data.id }, SECRET_KEY, {
        expiresIn: 86400 // 24 heures
      });

      // Répondre avec les informations de l'utilisateur et le token
      res.send({
        user: {
          id: data.id,
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
        },
        token
      });
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Une erreur s\'est produite lors de la création de l\'utilisateur'
    });
  }
};

exports.findAll = (req, res) => {
  User.findAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Une erreur s\'est produite lors de la récupération des utilisateurs'
      });
    } else {
      res.send(data);
    }
  });
};

exports.auth = async (req, res) => {
  const { email, password } = req.body;

  User.authenticate(email, async (err, user) => {
    if (err) {
      return res.status(403).send({ message: err.message });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(403).send({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id, role: user.role_id }, SECRET_KEY, { expiresIn: '24h' });

    res.status(200).send({ token });
  });
};

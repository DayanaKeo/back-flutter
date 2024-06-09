const User = require('../model/user');

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
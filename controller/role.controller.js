const Role = require('../model/role.sql');
require('dotenv').config();

exports.findAll = (req, res) => {
    Role.findAll((err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || 'Une erreur s\'est produite lors de la récupération des utilisateurs'
        });
      } else {
        res.send(data);
      }
    });
  };
  
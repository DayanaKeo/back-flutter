const sql = require('../config/db')
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

const User = function(user) {
  this.prenom = user.prenom;
  this.nom = user.nom;
  this.email = user.email;
  this.password = user.password;
};

User.create = async (newUser, result) => {
  try {
    newUser.password = await bcrypt.hash(newUser.password, 10);
    sql.query("INSERT INTO user SET ?", newUser, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("created user: ", { id: res.insertId, ...newUser });
      result(null, { id: res.insertId, ...newUser });
    });
  } catch (error) {
    result(error, null);
  }
};

User.findAll = (result) => {
  sql.query('SELECT * FROM user', (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
      return;
    }
    console.log('users: ', res);
    result(null, res);
  });
};

User.findByEmail = (email, password, result) => {
  sql.query('SELECT * FROM user WHERE email = ?', [email], async (err, res) => {
      if (err) {
          console.log('error: ', err);
          result(err, null);
          return;
      }

      if (res.length) {
          const user = res[0];
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
              result(null, user);
          } else {
              result({ message: 'Mot de passe incorrect' }, null);
          }
      } else {
          result({ message: 'Utilisateur non trouvé' }, null);
      }
  });
};

module.exports = User;
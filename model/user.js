const sql = require('../config/db');
const bcrypt = require('bcrypt');

const User = function(user) {
  this.prenom = user.prenom;
  this.nom = user.nom;
  this.email = user.email;
  this.password = user.password;
  this.password2 = user.password2
  this.role_id = user.role_id
};

User.create = async (newUser, result) => {
  try {
    sql.query("INSERT INTO user SET ?", newUser, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("Création de l'utilisateur: ", { id: res.insertId, ...newUser });
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

User.authenticate = async (email, password) => {
  return new Promise((resolve, reject) => {
    sql.query("SELECT * FROM user WHERE email = ?", [email], async (err, res) => {
      if (err) {
        return reject(err);
      }
      if (res.length) {
        const user = res[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return resolve(user);
        }
      }
      return reject('Authentication failed');
    });
  });
};


module.exports = User;

const sql = require('../config/db');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');


const User = function(user) {
  this.prenom = user.prenom;
  this.nom = user.nom;
  this.email = user.email;
  this.password = user.password;
  this.password2 = user.password2
  this.role_id = user.role_id
  this.email_activate = user.email_activate || false;
  this.two_factor_secret = user.two_factor_secret || null;
  this.two_factor_enabled = user.two_factor_enabled || false;
};

User.create = (newUser) => {
  return new Promise((resolve, reject) => {
    sql.query("INSERT INTO user SET ?", newUser, (err, res) => {
      if (err) {
        console.log("error: ", err);
        reject(err);
        return;
      }
      console.log("Création de l'utilisateur: ", { id: res.insertId, ...newUser });
      resolve({ id: res.insertId, ...newUser });
    });
  });
};

User.saveUser = (user) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE user SET email_activate = ?, two_factor_enabled = ?, two_factor_secret = ? WHERE id = ?';
    sql.query(query, [user.email_activate, user.two_factor_enabled, user.two_factor_secret, user.id], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

User.findById = (userId) => {
  return new Promise((resolve, reject) => {
    sql.query("SELECT * FROM user WHERE id = ?", [userId], (err, res) => {
      if (err) {
        reject(err);
      } else if (res.length) {
        resolve(res[0]);
      } else {
        resolve(null);
      }
    });
  });
};

User.findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    sql.query("SELECT * FROM user WHERE email = ?", [email], (err, res) => {
      if (err) {
        reject(err);
      } else if (res.length) {
        resolve(res[0]);
      } else {
        resolve(null);
      }
    });
  });
};
                
                
User.updateEmailActivate = (userId, callback) => {
  sql.query(
    'UPDATE user SET email_activate = true WHERE id = ?',
    [userId],
    (err, res) => {
      if (err) {
        console.error('Error updating email activation:', err);
        callback(err, null);
        return;
        }
        console.log('Email activation updated successfully');
        const activationLink = `http://localhost:4000/activate-2fa?userId=${userId}`;
        
        // Envoyer le callback avec le lien d'activation 2FA
        callback(null, { message: 'Email activation updated successfully', activationLink });
      }
  );
}
                        
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
User.updatePassword = (userId, newPassword, result) => {
  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.log("bcrypt error: ", err);
      result(err, null);
      return;
    }
    sql.query(
      "UPDATE user SET password = ? WHERE id = ?",
      [hashedPassword, userId],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        if (res.affectedRows == 0) {
          // Aucun utilisateur trouvé avec l'ID
          result({ message: "Utilisateur non trouvé." }, null);
          return;
        }
        result(null, { id: userId, newPassword: hashedPassword });
      }
    );
  });
};

// Méthode pour générer un token de réinitialisation de mot de passe
User.generateResetPasswordToken = (userId, callback) => {
  const token = jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '10m' });
  callback(token);
};

// Méthode pour vérifier et décoder le token de réinitialisation de mot de passe
User.verifyResetPasswordToken = (token, callback) => {
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      callback(err, null);
      return;
    }
    const userId = decoded.id;
    callback(null, userId);
  });
};

User.storeResetToken = (userId, token, tokenExpiry, result) => {
  sql.query(
    "UPDATE user SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
    [token, tokenExpiry, userId],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      result(null, res);
    }
  );
};

User.findByResetToken = (token, result) => {
  sql.query(
    "SELECT * FROM user WHERE reset_token = ? AND reset_token_expiry > ?",
    [token, Date.now()],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        result(null, res[0]);
        return;
      }
      result(null, null);
    }
  );
};

User.updatePassword = (userId, newPassword, result) => {
  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.log("bcrypt error: ", err);
      result(err, null);
      return;
    }
    sql.query(
      "UPDATE user SET password = ? WHERE id = ?",
      [hashedPassword, userId],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        if (res.affectedRows == 0) {
          result({ message: "Utilisateur non trouvé." }, null);
          return;
        }
        result(null, { id: userId, newPassword: hashedPassword });
      }
    );
  });
};

User.clearResetToken = (userId, result) => {
  sql.query(
    "UPDATE user SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
    [userId],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      result(null, res);
    }
  );
};

// User.verifyTwoFactorToken = (userId, token, callback) => {
//   sql.query('SELECT * FROM user WHERE id = ?', [userId], async (err, res) => {
//     if (err) {
//       console.error('Erreur lors de la recherche de l\'utilisateur :', err);
//       return callback(err, null);
//     }

//     if (res.length === 0) {
//       return callback({ message: 'Utilisateur non trouvé' }, null);
//     }

//     const user = res[0];

//     if (!user.two_factor_secret) {
//       return callback({ message: 'Secret 2FA non généré pour l\'utilisateur' }, null);
//     }

//     const verified = speakeasy.totp.verify({
//       secret: user.two_factor_secret,
//       encoding: 'base32',
//       token: token,
//       digits: 5,
//       step: 3600
//     });

//     if (verified) {
//       // Mettre à jour l'état 2FA de l'utilisateur à true
//       sql.query('UPDATE user SET two_factor_enabled = ? WHERE id = ?', [true, userId], (err, result) => {
//         if (err) {
//           console.error('Erreur lors de la mise à jour du statut 2FA :', err);
//           return callback(err, null);
//         }
//         callback(null, { message: 'Code vérifié avec succès' });
//       });
//     } else {
//       callback({ message: 'Code invalide' }, null);
//     }
//   });
// };

module.exports = User;

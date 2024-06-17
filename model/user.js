const sql = require('../config/db');
const bcrypt = require('bcrypt');

const User = function(user) {
  this.prenom = user.prenom;
  this.nom = user.nom;
  this.email = user.email;
  this.password = user.password;
  this.password2 = user.password2
  this.role_id = user.role_id
  this.email_activate = user.email_activate || false;
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

User.findByEmail = (email, result) => {
  sql.query("SELECT * FROM user WHERE email = ?", [email], (err, res) => {
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
      callback(null, res);
    }
  );
}

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


module.exports = User;

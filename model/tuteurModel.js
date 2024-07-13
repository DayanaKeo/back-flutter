const sql = require('../config/db');

const Tuteur = function(tuteur) {
    this.id = tuteur.id;
    this.child_id = tuteur.child_id;
    this.user_id = tuteur.user_id;
    this.tel = tuteur.tel;
    this.lien_affilie = tuteur.lien_affilie;
};

Tuteur.create = (newTuteur) => {
  return new Promise((resolve, reject) => {
    sql.query("INSERT INTO tuteur SET ?", newTuteur, (err, res) => {
      if (err) {
        console.log("error: ", err);
        reject(err);
        return;
      }
      console.log("Création du tuteur: ", { id: res.insertId, ...newTuteur });
      resolve({ id: res.insertId, ...newTuteur });
    });
  });
};

Tuteur.findById = (id) => {
    return new Promise((resolve, reject) => {
      sql.query("SELECT * FROM tuteur WHERE id = ?", [id], (err, res) => {
        if (err) {
          reject(err);
        } else if (res.length) {
          resolve(res[0]);
        } else {
            reject({ kind: "not_found" });
        }
      });
    });
};


Tuteur.getChildrenByContactUrg = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM child
      INNER JOIN user ON child.user_id = user.id
      WHERE user.id = ?;
    `;
    connection.execute(query, [userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};


// Tuteur.findAll = (result) => {
//     sql.query('SELECT * FROM tuteur', (err, res) => {
//       if (err) {
//         console.log('error: ', err);
//         result(err, null);
//         return;
//       }
//       console.log('Tuteur: ', res);
//       result(null, res);
//     });
// };

Tuteur.updateByUserId = (userId, tuteur) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "UPDATE tuteur SET ? WHERE user_id = ?",
      [tuteur, userId],
      (err, res) => {
        if (err) {
          console.error("Erreur lors de la mise à jour du tuteur:", err);
          reject(err);
          return;
        }
        if (res.affectedRows == 0) {
          reject({ kind: "not_found" });
          return;
        }
        resolve({ user_id: userId, ...tuteur });
      }
    );
  });
};

// Tuteur.deleteById = (id) => {
//   return new Promise((resolve, reject) => {
//     sql.query("DELETE FROM tuteur WHERE id = ?", id, (err, result) => {
//       if (err) {
//         console.error("Erreur lors de la suppression du tuteur:", err);
//         reject(err);
//         return;
//       }

//       if (result.affectedRows === 0) {
//         reject({ kind: "not_found" });
//         return;
//       }

//       resolve(result);
//     });
//   });
// };

module.exports = Tuteur;

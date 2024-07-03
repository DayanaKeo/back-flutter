const sql = require('../config/db');

const Tuteur = function(tuteur) {
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

Tuteur.findTuteurById = (userId) => {
  return new Promise((resolve, reject) => {
    sql.query("SELECT * FROM tuteur WHERE user_id = ?", [userId], (err, res) => {
      if (err) {
        reject(err);
      } else if (res.length) {
        resolve(res[0]);
      } else {
        resolve(null); // Si aucun tuteur trouvé
      }
    });
  });
};

// Tuteur.findById = (id) => {
//     return new Promise((resolve, reject) => {
//       sql.query("SELECT * FROM tuteur WHERE id = ?", [id], (err, res) => {
//         if (err) {
//           reject(err);
//         } else if (res.length) {
//           resolve(res[0]);
//         } else {
//             reject({ kind: "not_found" });
//         }
//       });
//     });
// };

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

// Tuteur.updateById = (id, tuteur) => {
//   return new Promise((resolve, reject) => {
//     sql.query(
//       "UPDATE tuteur SET ? WHERE id = ?",
//       [tuteur, id],
//       (err, result) => {
//         if (err) {
//           console.error("Erreur lors de la mise à jour du tuteur:", err);
//           reject(err);
//           return;
//         }

//         if (result.affectedRows === 0) {
//           reject({ kind: "not_found" });
//           return;
//         }

//         console.log("Tuteur mis à jour:", { id, ...tuteur });
//         resolve({ id, ...tuteur });
//       }
//     );
//   });
// };

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

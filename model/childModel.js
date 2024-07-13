const sql = require('../config/db');

const Child = function(child) {
    this.id = child.id;
    this.prenom = child.prenom;
    this.nom = child.nom;
    this.age = child.age;
    this.contact_id = child.contact_id;
    this.user_id = child.user_id;
    this.tuteur_id = child.tuteur_id
};

Child.create = (newChild) => {
  return new Promise((resolve, reject) => {
    sql.query("INSERT INTO child SET ?", newChild, (err, res) => {
      if (err) {
        console.log("error: ", err);
        reject(err);
        return;
      }
      console.log("Création de l'enfant: ", { id: res.insertId, ...newChild });
      resolve({ id: res.insertId, ...newChild });
    });
  });
};

Child.createChildForUser = (newChild) => {
  return new Promise((resolve, reject) => {
    sql.query("INSERT INTO child SET ?", newChild, (err, res) => {
      if (err) {
        console.log("error: ", err);
        reject(err);
        return;
      }
      console.log("Création de l'enfant: ", { id: res.insertId, ...newChild });
      resolve({ id: res.insertId, ...newChild });
    });
  });
};


Child.findById = (childId) => {
    return new Promise((resolve, reject) => {
      sql.query("SELECT * FROM child WHERE id = ?", [childId], (err, res) => {
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

Child.findAll = (result) => {
    sql.query('SELECT * FROM child', (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
        return;
      }
      console.log('enfants: ', res);
      result(null, res);
    });
};

Child.getChildrenByContactUrg = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM child
      WHERE contact_id = ? ;
    `;
    sql.execute(query, [userId], (err, results) => { // Correction ici
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Child.getChildrenByTuteurUser = (userId, tuteurId) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT child.*
//       FROM tuteur
//       INNER JOIN child ON tuteur.id = child.tuteur_id
//       WHERE tuteur.user_id = ? AND child.tuteur_id = ?;
//     `;
//     sql.execute(query, [userId, tuteurId], (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(results);
//     });
//   });
// };

Child.getChildrenByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM child WHERE user_id = ?";
    sql.query(query, [userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

Child.getChildrenByTuteurUser = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT child.*
      FROM tuteur
      INNER JOIN child ON tuteur.id = child.tuteur_id
      WHERE tuteur.user_id = ?;
    `;
    sql.execute(query, [userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

Child.updateById = (id, child) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "UPDATE child SET ? WHERE id = ?",
      [child, id],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour de l'enfant:", err);
          reject(err);
          return;
        }

        if (result.affectedRows === 0) {
          reject({ kind: "not_found" });
          return;
        }

        console.log("Enfant mis à jour:", { id, ...child });
        resolve({ id, ...child });
      }
    );
  });
};

Child.deleteById = (id) => {
  return new Promise((resolve, reject) => {
    // Commencer par supprimer les enregistrements liés dans `contact_urg`
    sql.query("DELETE FROM contact_urg WHERE child_id = ?", id, (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression des contacts d'urgence:", err);
        reject(err);
        return;
      }

      // Supprimer l'enfant après avoir supprimé les enregistrements liés dans `contact_urg`
      sql.query("DELETE FROM child WHERE id = ?", id, (err, result) => {
        if (err) {
          console.error("Erreur lors de la suppression de l'enfant:", err);
          reject(err);
          return;
        }

        if (result.affectedRows === 0) {
          reject({ kind: "not_found" });
          return;
        }

        resolve(result);
      });
    });
  });
};

module.exports = Child;

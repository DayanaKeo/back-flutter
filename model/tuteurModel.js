const sql = require('../config/db');

const Tuteur = function(tuteur) {
    this.id = tuteur.id;
    this.tel = tuteur.tel;
    this.lien = tuteur.lien;
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

Tuteur.findAll = (result) => {
    sql.query('SELECT * FROM tuteur', (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
        return;
      }
      console.log('Tuteur: ', res);
      result(null, res);
    });
};

Tuteur.updateById = (id, tuteur) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "UPDATE tuteur SET ? WHERE id = ?",
      [tuteur, id],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour du tuteur:", err);
          reject(err);
          return;
        }

        if (result.affectedRows === 0) {
          reject({ kind: "not_found" });
          return;
        }

        console.log("Tuteur mis à jour:", { id, ...tuteur });
        resolve({ id, ...tuteur });
      }
    );
  });
};

Tuteur.deleteById = (id) => {
  return new Promise((resolve, reject) => {
    sql.query("DELETE FROM tuteur WHERE id = ?", id, (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression du tuteur:", err);
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
};

module.exports = Tuteur;

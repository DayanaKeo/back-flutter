const sql = require('../config/db');

const Child = function(child) {
    this.id = child.id;
    this.prenom = child.prenom;
    this.nom = child.nom;
    this.age = child.age;
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
};

module.exports = Child;

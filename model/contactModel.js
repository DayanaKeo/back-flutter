const sql = require('../config/db');

const Contact = function(contact) {
    this.prenom = contact.prenom;
    this.nom = contact.nom;
    this.tel = contact.tel;
    this.lien_affilie = contact.lien_affilie;
    this.user_id = contact.user_id;
    this.child_id = contact.child_id
};

Contact.create = (newContact) => {
    return new Promise((resolve, reject) => {
      sql.query("INSERT INTO contact_urg SET ?", newContact, (err, res) => {
        if (err) {
          console.log("error: ", err);
          reject(err);
          return;
        }
        console.log("Création du contact d\'urgence: ", { id: res.insertId, ...newContact });
        resolve({ id: res.insertId, ...newContact });
      });
    });
};

Contact.getContactByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM contact_urg WHERE user_id = ?";
    sql.query(query, [userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

Contact.updateById = (id, contact) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "UPDATE contact_urg SET ? WHERE id = ?",
      [contact, id],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour du contact:", err);
          reject(err);
          return;
        }

        if (result.affectedRows === 0) {
          reject({ kind: "not_found" });
          return;
        }

        console.log("Contact mis à jour:", { id, ...contact });
        resolve({ id, ...contact });
      }
    );
  });
};


Contact.deleteById = (id) => {
  return new Promise((resolve, reject) => {
    // Commencer par supprimer les enregistrements liés dans `contact_urg`
    // sql.query("DELETE FROM child WHERE contact_id = ?", id, (err, result) => {
    //   if (err) {
    //     console.error("Erreur lors de la suppression des contacts d'urgence:", err);
    //     reject(err);
    //     return;
    //   }

      // Supprimer le contact après avoir supprimé les enregistrements liés dans `contact_urg`
      sql.query("DELETE FROM contact_urg WHERE id = ?", id, (err, result) => {
        if (err) {
          console.error("Erreur lors de la suppression du contact:", err);
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


module.exports = Contact;

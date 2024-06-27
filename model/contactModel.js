const sql = require('../config/db');

const Contact = function(contact) {
    this.prenom = contact.prenom;
    this.nom = contact.nom;
    this.tel = contact.tel;
    this.lien_affilie = contact.lien_affilie;
    this.tuteur_id = contact.tuteur_id
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

module.exports = Contact;

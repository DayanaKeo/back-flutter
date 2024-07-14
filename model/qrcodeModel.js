// qrcodeModel.js
const sql = require('../config/db');
const qrcode = require('qrcode');

const Qrcode = function(qrcode) {
    this.id = qrcode.id;
    this.child_id = qrcode.child_id;
    this.contact_id = qrcode.contact_id;
    this.is_activated = qrcode.is_activated;
};


Qrcode.generate = async (childId) => {
    const qrData = `http://localhost:4000/qr-code/contact_info/${childId}`;
    try {
        const qrCodeUrl = await qrcode.toDataURL(qrData);
        return qrCodeUrl;
    } catch (err) {
        throw err;
    }
};

Qrcode.getChildContactInfo = (childId) => {
    return new Promise((resolve, reject) => {
        sql.query(`
            SELECT 
                child.prenom AS child_firstname, 
                child.nom AS child_lastname, 
                child.age AS child_age, 
                contact_urg.prenom AS contact_firstname, 
                contact_urg.nom AS contact_lastname, 
                contact_urg.tel AS contact_phone,
                qrcode.is_activated AS is_activated
            FROM child 
            JOIN contact_urg ON child.contact_id = contact_urg.id
            WHERE child.id = ?
        `, [childId], (err, res) => {
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

Qrcode.activate = (childId) => {
    return new Promise((resolve, reject) => {
        sql.query(`
            UPDATE qr_code 
            SET is_activated = TRUE 
            WHERE child_id = ?
        `, [childId], (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
};

module.exports = Qrcode;

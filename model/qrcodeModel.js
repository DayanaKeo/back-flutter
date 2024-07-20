const sql = require('../config/db');
const qrcode = require('qrcode');

const Qrcode = function(qrcode) {
    this.id = qrcode.id;
    this.child_id = qrcode.child_id;
    this.contact_id = qrcode.contact_id;
    this.is_activated = qrcode.is_activated;
};

Qrcode.create = async (childId, contactId, userId) => {
    const query = `
        INSERT INTO qrcode (child_id, contact_id, is_activated, created_at, updated_at, user_id)
        VALUES (?, ?, false, NOW(), NOW(), ?)
    `;
    return new Promise((resolve, reject) => {
        sql.query(query, [childId, contactId, userId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.insertId); // Renvoie l'ID du nouveau QR code
        });
    });
};

Qrcode.getChildContactInfo = (childId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                q.id AS qr_code_id, q.is_activated, q.created_at AS qr_code_created_at, q.updated_at AS qr_code_updated_at,
                c.id AS child_id, c.prenom AS child_prenom, c.nom AS child_nom, c.age AS child_age,
                cu.id AS contact_id, cu.nom AS contact_nom, cu.prenom AS contact_prenom, cu.tel AS contact_tel, cu.lien_affilie AS contact_lien_affilie,
                u.id AS user_id, u.prenom AS user_prenom, u.nom AS user_nom, u.email AS user_email
            FROM qrcode q
            LEFT JOIN child c ON q.child_id = c.id
            LEFT JOIN contact_urg cu ON q.contact_id = cu.id
            LEFT JOIN user u ON q.user_id = u.id
            WHERE q.child_id = ?;
        `;

        sql.query(query, [childId], (err, res) => {
            if (err) {
                return reject(err);
            }
            if (res.length) {
                const childInfo = {
                    qr_code_id: res[0].qr_code_id,
                    is_activated: res[0].is_activated,
                    qr_code_created_at: res[0].qr_code_created_at,
                    qr_code_updated_at: res[0].qr_code_updated_at,
                    child_id: res[0].child_id,
                    child_prenom: res[0].child_prenom,
                    child_nom: res[0].child_nom,
                    child_age: res[0].child_age,
                    contacts: res.map(row => ({
                        contact_id: row.contact_id,
                        contact_nom: row.contact_nom,
                        contact_prenom: row.contact_prenom,
                        contact_tel: row.contact_tel,
                        contact_lien_affilie: row.contact_lien_affilie,
                        user_id: row.user_id,
                        user_prenom: row.user_prenom,
                        user_nom: row.user_nom,
                        user_email: row.user_email
                    }))
                };
                return resolve(childInfo);
            }
            return resolve(null);
        });
    });
};

Qrcode.activate = (childId) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE qrcode
            SET is_activated = TRUE, updated_at = NOW()
            WHERE child_id = ?;
        `;

        sql.query(query, [childId], (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};

module.exports = Qrcode;

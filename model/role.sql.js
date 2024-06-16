const sql = require('../config/db');

const Role = function(roles) {
    this.nom = roles.nom;
};

Role.findAll = (result) => {
    sql.query('SELECT * FROM roles', (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
        return;
      }
      console.log('roles: ', res);
      result(null, res);
    });
  };
  



module.exports = Role;

const mysql =
    require('mysql2');

const connection =
    mysql.createConnection({
        host: 'localhost',
        user:'root',
        password:'',
        database: 'app_soslost'
    })

connection.connect(err => {
    if(err) throw err;
    console.log('Ma bdd est connecte')
})

module.exports= connection;

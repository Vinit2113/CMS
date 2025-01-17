const mysql = require('mysql')
require('dotenv').config();
const conn = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT_DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});




// connect to database
conn.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    
    console.log('Connected to database');
});


module.exports = conn
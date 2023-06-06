const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    port: "8889",
    user: "notes",
    password: "notes94",
    database: "notes"
});

module.exports = connection;
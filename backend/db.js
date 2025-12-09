// db.js
const mysql = require("mysql2/promise");

async function connect() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123123",
    database: "sistema_login"
  });

  console.log("MySQL conectado!");
  return connection;
}

module.exports = { connect };

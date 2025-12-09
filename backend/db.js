const mysql = require("mysql2/promise");

let pool;

async function connect() {
  if (pool) return pool;

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log("Pool de conexões MySQL criado!");
    return pool;

  } catch (error) {
    console.error("Erro ao conectar no MySQL:", error);
    throw error;
  }
}

module.exports = { connect };

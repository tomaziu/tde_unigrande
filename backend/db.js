const mysql = require("mysql2/promise");

async function connect() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT || 3306
    });

    console.log("Conectado ao MySQL!");
    return connection;

  } catch (error) {
    console.error("Erro ao conectar no MySQL:", error);
    throw error;
  }
}

module.exports = { connect };

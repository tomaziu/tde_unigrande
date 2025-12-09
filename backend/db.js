const mysql = require("mysql2/promise");

async function connect() {
  try {
    const connection = await mysql.createConnection({
      host: "bh36dfbstunvlbw8qstc-mysql.services.clever-cloud.com",
      user: "uzs6cu1wlstbnaes",
      password: "6tXiHRJMLSv9CaAoMOG3",
      database: "bh36dfbstunvlbw8qstc",
      port: 3306
    });

    console.log("🟢 MySQL conectado com sucesso!");
    return connection;

  } catch (err) {
    console.error("🔴 ERRO ao conectar no MySQL:", err);
    throw err;
  }
}

module.exports = { connect };

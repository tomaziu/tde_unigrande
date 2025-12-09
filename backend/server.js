const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { connect } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(cors());
app.use(express.json());
let db = null;


// Conectar ao banco MySQL
(async () => {
  db = await connect();
})();

// Configuração para enviar email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "thomazdemoraisnunes2021@gmail.com",         // coloque seu Gmail verdadeiro
    pass: "zojq onpa tefq tzzi"      // aquela senha gerada pelo Google
  },
  logger: true,
  debug: true
});

transporter.verify((err, success) => {
  if (err) {
    console.log("Erro no email:", err);
  } else {
    console.log("Servidor pronto para enviar emails!");
  }
});

// ==================== ROTA DE CADASTRO ====================
app.post("/api/register", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha)
    return res.status(400).json({ error: "Campos obrigatórios." });

  const senhaCriptografada = await bcrypt.hash(senha, 10);

  const tokenConfirmacao = Math.random().toString(36).substring(2);

  try {
    await db.execute(
      "INSERT INTO usuarios (email, senha, token_confirmacao) VALUES (?, ?, ?)",
      [email, senhaCriptografada, tokenConfirmacao]
    );

    // Enviar o email de confirmação
    const link = `http://localhost:8000/api/confirmar?token=${tokenConfirmacao}`;

    await transporter.sendMail({
      from: "SEU_EMAIL@gmail.com",
      to: email,
      subject: "Confirme sua conta",
      html: `
        <h2>Bem-vindo!</h2>
        <p>Clique no link abaixo para confirmar sua conta:</p>
        <a href="${link}">Confirmar Conta</a>
      `
    });

    res.json({ message: "Usuário cadastrado! Verifique seu email." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro ao cadastrar." });
  }
});

// ==================== CONFIRMAR CONTA ====================
app.get("/api/confirmar", async (req, res) => {
  const { token } = req.query;

  const [rows] = await db.execute(
    "SELECT * FROM usuarios WHERE token_confirmacao = ?",
    [token]
  );

  if (rows.length === 0)
    return res.status(400).send("Token inválido.");

  await db.execute(
    "UPDATE usuarios SET confirmado = 1, token_confirmacao = NULL WHERE id = ?",
    [rows[0].id]
  );

  res.send("<h2>Conta confirmada com sucesso! Você já pode fazer login.</h2>");
});

// ==================== LOGIN ====================
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  const [usuarios] = await db.execute(
    "SELECT * FROM usuarios WHERE email = ?",
    [email]
  );

  if (usuarios.length === 0)
    return res.status(400).json({ error: "Usuário não encontrado." });

  const usuario = usuarios[0];

  if (usuario.confirmado === 0)
    return res.status(403).json({ error: "Confirme sua conta antes de logar." });

  const senhaOk = await bcrypt.compare(senha, usuario.senha);

  if (!senhaOk)
    return res.status(401).json({ error: "Senha incorreta." });

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    "CHAVE_SECRETA",
    { expiresIn: "2h" }
  );

  res.json({
    message: "Login realizado!",
    token
  });
});

app.post("/api/recuperar", async (req, res) => {
  const { email } = req.body;

  const [rows] = await db.execute(
    "SELECT * FROM usuarios WHERE email = ?",
    [email]
  );

  if (rows.length === 0)
    return res.status(400).json({ error: "Email não encontrado." });

  const token = Math.random().toString(36).substring(2);

  await db.execute(
    "UPDATE usuarios SET token_recuperacao = ? WHERE email = ?",
    [token, email]
  );

  const link = `http://localhost:8000/resetar.html?token=${token}`;

  await transporter.sendMail({
    from: "SEU_EMAIL@gmail.com",
    to: email,
    subject: "Recuperação de Senha",
    html: `
      <h2>Recuperar Senha</h2>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${link}">${link}</a>
    `
  });

  res.json({ message: "Email enviado! Verifique sua caixa de entrada." });
});

app.post("/api/resetar", async (req, res) => {
  const { token, novaSenha } = req.body;

  const [rows] = await db.execute(
    "SELECT * FROM usuarios WHERE token_recuperacao = ?",
    [token]
  );

  if (rows.length === 0)
    return res.status(400).json({ error: "Token inválido." });

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

  await db.execute(
    "UPDATE usuarios SET senha = ?, token_recuperacao = NULL WHERE id = ?",
    [senhaCriptografada, rows[0].id]
  );

  res.json({ message: "Senha alterada com sucesso!" });
});


// ==================== PORTA ====================
app.listen(8000, () => {
  console.log("Servidor rodando na porta 8000");
});

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { Resend } = require("resend");
const { connect } = require("./db");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Servir o frontend
app.use(express.static(path.join(__dirname, "..", "public")));

let db = null;

// Conectar ao BD
(async () => {
  db = await connect();
  console.log("Banco conectado!");
})();

// CONFIGURAÇÃO DO RESEND
const resend = new Resend(process.env.RESEND_API_KEY);

// Detectar URL base (Render ou Local)
function baseURL(req) {
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  return "http://localhost:8000";
}

// ==================== CADASTRO ====================
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

    const link = `${baseURL(req)}/api/confirmar?token=${tokenConfirmacao}`;

    // Enviar email usando Resend
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Confirme sua conta",
      html: `
        <h2>Bem-vindo!</h2>
        <p>Clique abaixo para confirmar sua conta:</p>
        <a href="${link}">${link}</a>
      `
    });

    res.json({ message: "Cadastro realizado! Verifique seu email." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro ao cadastrar." });
  }
});

// ==================== CONFIRMAR ====================
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

  res.send("<h2>Conta confirmada com sucesso! Agora você já pode fazer login.</h2>");
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
    return res.status(403).json({ error: "Confirme seu email antes de logar." });

  const senhaOk = await bcrypt.compare(senha, usuario.senha);

  if (!senhaOk)
    return res.status(401).json({ error: "Senha incorreta." });

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    "CHAVE_SECRETA",
    { expiresIn: "2h" }
  );

  res.json({ message: "Login realizado!", token });
});

// ==================== RECUPERAR SENHA ====================
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

  const link = `${baseURL(req)}/resetar.html?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Recuperação de Senha",
    html: `
      <h2>Recuperação de Senha</h2>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${link}">${link}</a>
    `
  });

  res.json({ message: "Email enviado! Verifique sua caixa de entrada." });
});

// ==================== RESETAR SENHA ====================
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

  res.json({ message: "Senha redefinida com sucesso!" });
});

// ==================== PORTA ====================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));

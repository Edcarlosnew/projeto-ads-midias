const nodemailer = require('nodemailer');
const crypto = require('crypto');
const criarTransportador = require('./mailer');
const express = require('express');
const db = require('./db');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const verificarToken = require('./authMiddleware');

require('dotenv').config();

const app = express();
const port = 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// ==================================================
// 🔓 ROTAS PÚBLICAS (Autenticação)
// ==================================================

// --- ROTA DE CADASTRO (ATUALIZADA COM E-MAIL DE ATIVAÇÃO) ---
app.post('/auth/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const [usuarios] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length > 0) {
      return res.status(409).json({ error: 'Este email já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 1. Gerar Token de Ativação
    const activationToken = crypto.randomBytes(20).toString('hex');

    // 2. Salvar no banco como NÃO verificado (is_verified = 0)
    await db.query(
      'INSERT INTO usuarios (nome, email, senha, is_verified, activation_token) VALUES (?, ?, ?, 0, ?)',
      [nome, email, senhaHash, activationToken]
    );

    // 3. Enviar E-mail de Ativação
    const transporter = await criarTransportador();
    const info = await transporter.sendMail({
      from: '"Gerenciador de Mídias" <noreply@gerenciador.com>',
      to: email,
      subject: 'Ative sua conta',
      html: `
        <h2>Bem-vindo, ${nome}!</h2>
        <p>Por favor, clique no link abaixo para ativar sua conta:</p>
        <a href="http://localhost:5173/activate/${activationToken}">ATIVAR MINHA CONTA</a>
        <p>Se o link não funcionar, copie este token: <strong>${activationToken}</strong></p>
      `,
    });

    console.log('Link de Ativação (Ethereal):', nodemailer.getTestMessageUrl(info));

    res.status(201).json({
      message: 'Cadastro realizado! Verifique seu e-mail para ativar a conta.',
      testUrl: nodemailer.getTestMessageUrl(info) // Para facilitar o teste
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// --- ROTA DE LOGIN (ATUALIZADA COM BLOQUEIO DE CONTA) ---
app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    // 1. Buscar o usuário pelo email
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    // Se não achar o email, aí sim é Credencial Inválida (para não dar dica se o email existe)
    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const usuario = usuarios[0];

    // 2. Verificar a SENHA primeiro
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      // Se a senha está errada, também é Credencial Inválida
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 3. AGORA SIM: Se email e senha batem, verificamos se está ATIVO
    if (usuario.is_verified === 0) {
      // Mensagem específica e clara!
      return res.status(403).json({
        error: 'Sua conta foi criada, mas ainda não foi ativada. Por favor, verifique seu e-mail e clique no link de ativação.' 
      });
    }

    // 4. Tudo certo? Gera o token
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ message: 'Login bem-sucedido!', token: token });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// --- ROTA NOVA: VERIFICAR E-MAIL (Confirmar Conta) ---
app.post('/auth/verify_email', async (req, res) => {
  const { token } = req.body;

  try {
    // Busca usuário com esse token de ativação
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE activation_token = ?', [token]);

    if (usuarios.length === 0) {
      return res.status(400).json({ error: 'Token de ativação inválido.' });
    }

    const usuario = usuarios[0];

    // Ativa a conta e limpa o token
    await db.query(
      'UPDATE usuarios SET is_verified = 1, activation_token = NULL WHERE id = ?',
      [usuario.id]
    );

    res.json({ message: 'Conta ativada com sucesso! Agora você pode fazer login.' });

  } catch (error) {
    console.error('Erro na ativação:', error);
    res.status(500).json({ error: 'Erro ao ativar conta.' });
  }
});

// ROTA DE ESQUECI A SENHA
app.post('/auth/forgot_password', async (req, res) => {
  const { email } = req.body;

  try {
    const [usuarios] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    const usuario = usuarios[0];

    const token = crypto.randomBytes(20).toString('hex');
    const agora = new Date();
    agora.setHours(agora.getHours() + 1);

    await db.query(
      'UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [token, agora, usuario.id]
    );

    const transporter = await criarTransportador();
    const info = await transporter.sendMail({
      from: '"Gerenciador de Mídias" <noreply@gerenciador.com>',
      to: email,
      subject: 'Recuperação de Senha',
      html: `
        <p>Você solicitou a recuperação de senha.</p>
        <p>Use este token para redefinir sua senha: <strong>${token}</strong></p>
        <p>Ou clique no link abaixo (simulação):</p>
        <a href="http://localhost:5173/reset-password/${token}">Redefinir Senha</a>
      `,
    });

    console.log('Link de teste do E-mail:', nodemailer.getTestMessageUrl(info));

    res.json({
      message: 'E-mail de recuperação enviado!',
      testUrl: nodemailer.getTestMessageUrl(info)
    });

  } catch (error) {
    console.error('Erro no esqueci a senha:', error);
    res.status(500).json({ error: 'Erro interno ao tentar recuperar senha.' });
  }
});

// ROTA DE REDEFINIR SENHA
app.post('/auth/reset_password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const [usuarios] = await db.query(
      'SELECT * FROM usuarios WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );

    if (usuarios.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const usuario = usuarios[0];
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE usuarios SET senha = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [senhaHash, usuario.id]
    );

    res.json({ message: 'Senha alterada com sucesso! Agora você pode fazer login.' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
  }
});

// ==================================================
// 🔒 ROTAS PROTEGIDAS (Mídias)
// ==================================================

app.use('/midias', verificarToken);

// ROTA GET (Read)
app.get('/midias', async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const [midias] = await db.query('SELECT * FROM midias WHERE usuario_id = ?', [usuarioId]);
    res.json(midias);
  } catch (error) {
    console.error('Erro ao buscar mídias:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar mídias.' });
  }
});

// ROTA POST (Create)
app.post('/midias', async (req, res) => {
  const { titulo, url_midia } = req.body;
  const usuarioId = req.usuario.id;

  try {
    const [result] = await db.query(
      'INSERT INTO midias (titulo, url_midia, usuario_id) VALUES (?, ?, ?)',
      [titulo, url_midia, usuarioId]
    );
    const novaMidia = {
      id: result.insertId,
      titulo: titulo,
      url_midia: url_midia,
      usuario_id: usuarioId,
      texto_transcricao: null
    };
    res.status(201).json(novaMidia);
  } catch (error) {
    console.error('Erro ao criar mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao criar mídia.' });
  }
});

// ROTA PUT (Update)
app.put('/midias/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, url_midia } = req.body;
  try {
    await db.query(
      'UPDATE midias SET titulo = ?, url_midia = ? WHERE id = ?',
      [titulo, url_midia, id]
    );
    res.json({ message: 'Mídia atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar mídia.' });
  }
});

// ROTA DELETE (Delete)
app.delete('/midias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM midias WHERE id = ?', [id]);
    res.sendStatus(204);
  } catch (error) {
    console.error('Erro ao apagar mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao apagar mídia.' });
  }
});

// ROTA DE TRANSCRIÇÃO (Simulação)
app.post('/midias/:id/transcrever', async (req, res) => {
  const { id } = req.params;
  console.log(`Recebido pedido para transcrever a mídia com ID: ${id}`);

  let textoTranscribed;

  try {
    const [rows] = await db.query('SELECT titulo FROM midias WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mídia não encontrada.' });
    }

    const titulo = rows[0].titulo;

    switch (titulo) {
      case "Dino - It Must Have Been Love (Roxette)":
        textoTranscribed = "Transcrição sobre Rock e Flashback. A música é Roxette. Este é um teste para o projeto.";
        break;
      case "George Michael, Aretha Franklin - I Knew You Were Waiting":
        textoTranscribed = "Simulação da música de George Michael e Aretha Franklin. A OpenAI é uma tecnologia incrível.";
        break;
      case "Miami Sound Machine - Bad Boy (official video reworked)":
        textoTranscribed = "Este áudio é da banda Miami Sound Machine. A música é um clássico dos anos 80.";
        break;
      default:
        textoTranscribed = `Texto genérico para ${titulo}. A entrega está quase pronta. Simulação de custos.`;
    }

    await db.query(
      'UPDATE midias SET texto_transcricao = ? WHERE id = ?',
      [textoTranscribed, id]
    );

    res.json({
      message: 'Transcrição concluída com sucesso!',
      transcription: textoTranscribed
    });

  } catch (error) {
    console.error('Erro no processo de transcrição:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erro interno do servidor durante a transcrição.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado com sucesso na porta ${port}`);
});
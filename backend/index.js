const nodemailer = require('nodemailer');
const crypto = require('crypto'); // Já vem com o Node.js (gera códigos aleatórios)
const criarTransportador = require('./mailer'); // O nosso arquivo de e-mail
const express = require('express');
const db = require('./db');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. IMPORTAÇÃO DO MIDDLEWARE
const verificarToken = require('./authMiddleware');

// Carrega as variáveis de ambiente
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

// ROTA DE CADASTRO
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

    await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA DE LOGIN
app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const usuario = usuarios[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

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

// --- ROTA DE ESQUECI A SENHA (Forgot Password) ---
app.post('/auth/forgot_password', async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Verificar se o email existe
    const [usuarios] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    const usuario = usuarios[0];

    // 2. Gerar Token e Data de Expiração (1 hora)
    // Gera 20 bytes aleatórios e converte para texto (hexadecimal)
    const token = crypto.randomBytes(20).toString('hex');

    // Pega a hora de agora e soma 1 hora (3600000 milissegundos)
    // O formato para MySQL DATETIME é 'YYYY-MM-DD HH:MM:SS'
    const agora = new Date();
    agora.setHours(agora.getHours() + 1);

    // 3. Salvar no Banco de Dados
    await db.query(
      'UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [token, agora, usuario.id]
    );

    // 4. Enviar o E-mail (Usando Ethereal para teste)
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

    // Retornamos a URL de teste para você ver o email no navegador sem configurar nada
    res.json({
      message: 'E-mail de recuperação enviado!',
      testUrl: nodemailer.getTestMessageUrl(info)
    });

  } catch (error) {
    console.error('Erro no esqueci a senha:', error);
    res.status(500).json({ error: 'Erro interno ao tentar recuperar senha.' });
  }
});

// --- ROTA DE REDEFINIR SENHA (Reset Password) ---
app.post('/auth/reset_password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // 1. Procurar usuário com esse token e que o token ainda não tenha expirado
    // O 'NOW()' é a hora atual do banco de dados
    const [usuarios] = await db.query(
      'SELECT * FROM usuarios WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );

    if (usuarios.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const usuario = usuarios[0];

    // 2. Encriptar a nova senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(newPassword, salt);

    // 3. Atualizar a senha e limpar o token (para não ser usado de novo)
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

// 2. ATIVAÇÃO DO SEGURANÇA (CRUCIAL!)
// Isto protege todas as rotas abaixo. Sem isso, o login não serve para nada.
app.use('/midias', verificarToken);


// ROTA GET (Read)
app.get('/midias', async (req, res) => {
  try {
    // 3. USO DO ID DO TOKEN (CRUCIAL!)
    // Pega o ID do usuário que fez login, em vez do ID 1 fixo.
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

  // Usa o ID do usuário logado para criar a mídia
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
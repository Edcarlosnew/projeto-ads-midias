const express = require('express');
const db = require('./db');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Carrega as variáveis de ambiente (necessário para a chave da OpenAI)
require('dotenv').config();

const app = express();
const port = 3001;

// Configura a instância da OpenAI com a nossa chave de API do ficheiro .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// ROTA GET (Read): Buscar todas as mídias de um usuário
app.get('/midias', async (req, res) => {
  try {
    const usuarioId = 1;
    const [midias] = await db.query('SELECT * FROM midias WHERE usuario_id = ?', [usuarioId]);
    res.json(midias);
  } catch (error) {
    console.error('Erro ao buscar mídias:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar mídias.' });
  }
});

// ROTA POST (Create): Criar uma nova mídia
app.post('/midias', async (req, res) => {
  const { titulo, url_midia } = req.body;
  const usuarioId = 1;
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

// ROTA PUT (Update): Atualizar uma mídia existente
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

// ROTA DELETE (Delete): Apagar uma mídia existente
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

// --- ROTA DE TRANSCRIÇÃO (COM CORREÇÃO DE SINTAXE) ---
app.post('/midias/:id/transcrever', async (req, res) => {
  const { id } = req.params;
  console.log(`Recebido pedido para transcrever a mídia com ID: ${id}`);

  // 1. Declara a variável aqui, uma única vez.
  let textoTranscribed;

  try {
    // --- MODO DE SIMULAÇÃO ---
    textoTranscribed = "Este é um texto de transcrição simulado para a entrega do projeto. A lógica de chamada à API da OpenAI está pronta, mas em modo de simulação para evitar custos.";
    console.log('A usar texto simulado:', textoTranscribed);
    
    /*
    // --- MODO REAL (Atualmente comentado) ---
    const audioPath = path.join(__dirname, 'uploads', 'sample.mp3');

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: 'Ficheiro de áudio de teste (sample.mp3) não encontrado.' });
    }

    console.log(`A enviar o ficheiro de áudio para a OpenAI: ${audioPath}`);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
    });

    textoTranscribed = transcription.text;
    console.log('Texto recebido da OpenAI:', textoTranscribed);
    */

    // --- LÓGICA COMUM ---
    await db.query(
      'UPDATE midias SET texto_transcricao = ? WHERE id = ?',
      [textoTranscribed, id]
    );

    console.log(`Transcrição guardada com sucesso no banco de dados para a mídia ${id}.`);

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











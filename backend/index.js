const express = require('express');
const db = require('./db');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.send('Meu primeiro servidor está no ar!');
});

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
    await db.query('INSERT INTO midias (titulo, url_midia, usuario_id) VALUES (?, ?, ?)', [titulo, url_midia, usuarioId]);
    res.status(201).json({ message: 'Mídia criada com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao criar mídia.' });
  }
});

// --- ROTA NOVA ABAIXO ---
// ROTA PUT (Update): Atualizar uma mídia existente
app.put('/midias/:id', async (req, res) => {
  // Pega o ID da mídia da URL (ex: /midias/1)
  const { id } = req.params; 
  // Pega os novos dados do corpo da requisição
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

// --- ROTA NOVA ABAIXO ---
// ROTA DELETE (Delete): Apagar uma mídia existente
app.delete('/midias/:id', async (req, res) => {
  // Pega o ID da mídia da URL
  const { id } = req.params;

  try {
    await db.query('DELETE FROM midias WHERE id = ?', [id]);
    // Retorna uma resposta de sucesso sem conteúdo
    res.sendStatus(204); 
  } catch (error) {
    console.error('Erro ao apagar mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao apagar mídia.' });
  }
});


app.listen(port, () => {
  console.log(`Servidor iniciado com sucesso na porta ${port}`);
});
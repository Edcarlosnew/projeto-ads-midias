// Arquivo: backend/authMiddleware.js

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // 1. O token virá no cabeçalho 'Authorization'
  // O formato padrão é: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Pega só o token

  // 2. Se não houver token, barra a entrada
  if (token == null) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
  }

  // 3. Verifica se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      // Se o token for inválido ou expirado
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }

    // 4. SUCESSO! O token é válido.
    // Adicionamos o payload do token (que contém o ID e nome)
    // ao objeto 'req' para que as próximas rotas possam usá-lo.
    req.usuario = usuario;
    
    // Chama a próxima função (a rota de mídia)
    next();
  });
}

module.exports = verificarToken;
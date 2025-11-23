function verificarAdmin(req, res, next) {
  // O 'req.usuario' já foi preenchido pelo authMiddleware anterior
  // Agora só verificamos se o papel é 'admin'
  if (req.usuario && req.usuario.role === 'admin') {
    next(); // Pode passar, chefe!
  } else {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
}

module.exports = verificarAdmin;
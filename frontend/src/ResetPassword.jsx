import { useState } from 'react';
import axios from 'axios';
import './Login.css';

function ResetPassword({ token, onLoginClick }) {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      // Chama a rota que criamos no Backend
      await axios.post('http://localhost:3001/auth/reset_password', {
        token,
        newPassword: senha
      });

      setMessage('Senha alterada com sucesso!');
      // Limpa os campos
      setSenha('');
      setConfirmarSenha('');

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao redefinir senha. O link pode ter expirado.');
      }
    }
  };

  if (message) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="success-message" style={{ padding: '20px' }}>
            <h3>Tudo certo!</h3>
            <p>{message}</p>
            <button onClick={onLoginClick} className="btn-link" style={{ marginTop: '15px' }}>
              Voltar para o Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Nova Senha</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>Defina sua nova senha abaixo.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nova Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar Senha:</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Alterar Senha
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
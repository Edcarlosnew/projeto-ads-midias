import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import './Login.css';

// ▼▼▼ RECEBE A NOVA FUNÇÃO 'onForgotPasswordClick' ▼▼▼
function Login({ onRegisterClick, onForgotPasswordClick }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        senha
      });

      const token = response.data.token;
      login(token);

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao conectar com o servidor.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Entrar no Gerenciador</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            {/* ▼▼▼ LINK DE ESQUECI A SENHA ▼▼▼ */}
            <div style={{ textAlign: 'right', marginTop: '5px' }}>
              <button
                type="button"
                onClick={onForgotPasswordClick}
                style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login">Entrar</button>
        </form>

        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Ainda não tem conta?</p>
          <button
            type="button"
            onClick={onRegisterClick}
            style={{ background: 'none', border: 'none', color: '#1877f2', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }}
          >
            Criar nova conta
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
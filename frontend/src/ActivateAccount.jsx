import { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css'; // Reutilizamos o estilo do login

function ActivateAccount({ token, onLoginClick }) {
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    // Assim que a tela carrega, enviamos o token para o backend
    const activate = async () => {
      try {
        await axios.post('http://localhost:3001/auth/verify_email', { token });
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };
    activate();
  }, [token]);

  return (
    <div className="login-container">
      <div className="login-box">
        {status === 'loading' && (
          <div>
            <h2>Ativando Conta...</h2>
            <p>Aguarde um momento.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success-message" style={{ padding: '20px' }}>
            <h2>🎉 Sucesso!</h2>
            <p>Sua conta foi verificada e ativada.</p>
            <button
              onClick={onLoginClick}
              className="btn-link"
              style={{ marginTop: '15px', fontSize: '1.1rem' }}
            >
              Ir para o Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <h2 style={{ color: '#e74c3c' }}>Erro</h2>
            <p className="error-message">Link inválido ou expirado.</p>
            <button onClick={onLoginClick} className="btn-text">
              Voltar ao Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivateAccount;
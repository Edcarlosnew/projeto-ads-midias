import { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Vamos reutilizar o CSS do Login

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/auth/forgot_password', { email });
      setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada (ou o link de teste).');

      // Para facilitar o teste, vamos mostrar o link fake na tela também
      if (response.data.testUrl) {
        console.log("Link de teste:", response.data.testUrl);
        alert(`MODO TESTE: Link gerado no console (F12) ou aqui: \n${response.data.testUrl}`);
      }

    } catch (err) {
      console.error(err); // <-- Adicione esta linha para usar a variável 'err'
      setError('Erro ao enviar e-mail. Verifique se o endereço está correto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Recuperar Senha</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>Digite seu e-mail para receber o link de redefinição.</p>

        {message && <div className="success-message" style={{padding: '10px', marginBottom: '15px'}}>{message}</div>}
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

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>

        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <button
            type="button"
            onClick={onBackToLogin}
            className="btn-text"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
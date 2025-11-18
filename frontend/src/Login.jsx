import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  // Pega a função 'login' do nosso Contexto para usar quando der tudo certo
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    try {
      // 1. Envia os dados para o Backend
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        senha
      });

      // 2. Se chegou aqui, o login funcionou!
      const token = response.data.token;

      // 3. Avisa o Contexto que temos um token novo
      login(token);

    } catch (err) {
      // Se der erro (ex: senha errada), mostra mensagem
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
          </div>

          <button type="submit" className="btn-login">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
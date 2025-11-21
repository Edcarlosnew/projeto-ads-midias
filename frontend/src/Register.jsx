import { useState } from 'react';
import axios from 'axios';
import './Register.css';

// Recebe uma função 'onLoginClick' para voltar para a tela de login
function Register({ onLoginClick }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Envia os dados para a rota de cadastro que criamos no Backend
      await axios.post('http://localhost:3001/auth/register', {
        nome,
        email,
        senha
      });

      // Se der certo, mostra mensagem de sucesso
      setSuccess(true);
      // Limpa o formulário
      setNome('');
      setEmail('');
      setSenha('');

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao cadastrar usuário.');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Criar Nova Conta</h2>

        {success ? (
          <div className="success-message">
            <p>Conta criada com sucesso!</p>
            <button onClick={onLoginClick} className="btn-link">
              Clique aqui para entrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

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

            <button type="submit" className="btn-register">Cadastrar</button>

            <div className="login-link">
              <p>Já tem uma conta?</p>
              <button type="button" onClick={onLoginClick} className="btn-text">
                Fazer Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
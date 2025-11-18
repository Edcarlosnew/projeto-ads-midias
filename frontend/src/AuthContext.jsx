import { createContext, useState, useEffect } from 'react';

// Cria o contexto (a "nuvem" de dados acessível a toda a aplicação)
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Tenta buscar um token salvo no localStorage ao iniciar (para não deslogar no F5)
  const [token, setToken] = useState(localStorage.getItem('token'));

  // O estado 'user' pode guardar informações decodificadas do token no futuro
  // Por enquanto, se tem token, assumimos que tem um usuário logado.
  const [user, setUser] = useState(token ? { token } : null);

  useEffect(() => {
    if (token) {
      // Se o token mudar (login), salvamos no navegador
      localStorage.setItem('token', token);
      setUser({ token });
    } else {
      // Se o token for removido (logout), limpamos o navegador
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // Função chamada pelo formulário de Login
  const login = (newToken) => {
    setToken(newToken);
  };

  // Função chamada pelo botão de Sair
  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
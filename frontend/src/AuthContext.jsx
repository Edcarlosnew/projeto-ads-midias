import { createContext, useState, useEffect } from 'react';
// 1. Importamos a biblioteca que acabamos de instalar
import { jwtDecode } from "jwt-decode";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);

      // 2. TENTATIVA DE DECODIFICAR O TOKEN
      try {
        // O jwtDecode abre o token e lê o que tem dentro (id, nome, exp)
        const decoded = jwtDecode(token);

        // Verifica se o token expirou (opcional, mas boa prática)
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Se expirou, faz logout forçado
          logout();
        } else {
          // Se está válido, salvamos os dados (nome, id) no estado 'user'
          setUser({ ...decoded, token });
        }
      } catch (error) {
      console.error("Erro ao decodificar token:", error); // <-- Adicionamos esta linha
      // Se o token for inválido ou estiver corrompido
      logout();
    }
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import './App.css';

import { AuthContext } from "./AuthContext.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import ResetPassword from "./ResetPassword.jsx";
import ActivateAccount from "./ActivateAccount.jsx"; // <-- NOVO IMPORT
import MediaForm from './MediaForm';

const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

function App() {
  const { user, logout } = useContext(AuthContext);

  // Estados de navegação
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  // Estados para rotas especiais (via URL)
  const [resetToken, setResetToken] = useState(null);
  const [activationToken, setActivationToken] = useState(null); // <-- NOVO ESTADO

  // Estados do Gerenciador
  const [midias, setMidias] = useState([]);
  const [editingMidia, setEditingMidia] = useState(null);
  const [selectedMidia, setSelectedMidia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleTranscriptionId, setVisibleTranscriptionId] = useState(null);
  const [transcribingId, setTranscribingId] = useState(null);

  // --- EFEITO PARA DETECTAR LINKS NA URL ---
  useEffect(() => {
    const path = window.location.pathname;

    // Rota de Reset de Senha
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) setResetToken(token);
    }

    // Rota de Ativação de Conta (NOVO)
    if (path.startsWith('/activate/')) {
      const token = path.split('/activate/')[1];
      if (token) setActivationToken(token);
    }
  }, []);

  // Função para limpar a URL e voltar ao Login
  const clearUrl = () => {
    window.history.pushState({}, document.title, "/");
    setResetToken(null);
    setActivationToken(null);
    setIsForgot(false);
    setIsRegistering(false);
  };

  // --- LÓGICA DE BUSCA E CRUD ---
  const fetchMidias = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:3001/midias', config);
      setMidias(response.data);
    } catch (error) {
      console.error("Erro:", error);
      if (error.response && error.response.status === 401) logout();
    }
  };

  useEffect(() => {
    if (user) fetchMidias();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMidiaAdded = () => fetchMidias();

  const handleDelete = async (id) => {
    if(!confirm("Tem certeza?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/midias/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchMidias();
      if (selectedMidia?.id === id) setSelectedMidia(null);
    } catch (error) {
      console.error(error);
      alert("Falha ao apagar.");
    }
  };

  const handleEdit = (midia) => setEditingMidia(midia);

  const handleSelectMidia = (midia) => {
    setSelectedMidia(midia);
    setVisibleTranscriptionId(null);
  };

  const handleTranscribeClick = async (e, midia) => {
    e.stopPropagation();
    setSelectedMidia(midia);
    if (midia.texto_transcricao) {
      setVisibleTranscriptionId(cur => cur === midia.id ? null : midia.id);
    } else {
      setTranscribingId(midia.id);
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:3001/midias/${midia.id}/transcrever`, {}, { headers: { Authorization: `Bearer ${token}` } });
        await fetchMidias();
        setTranscribingId(null);
        setVisibleTranscriptionId(midia.id);
      } catch (error) {
        console.error(error);
        alert("Erro na transcrição.");
        setTranscribingId(null);
      }
    }
  };

  const midiasParaExibir = searchTerm.trim() === ''
    ? midias
    : midias.filter(m => m.texto_transcricao && m.texto_transcricao.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- ROTEAMENTO MANUAL ---

  // 1. Tela de Ativação (Prioridade Alta)
  if (activationToken) {
    return <ActivateAccount token={activationToken} onLoginClick={clearUrl} />;
  }

  // 2. Tela de Reset de Senha
  if (resetToken) {
    return <ResetPassword token={resetToken} onLoginClick={clearUrl} />;
  }

  // 3. Telas de Autenticação (Sem usuário)
  if (!user) {
    if (isForgot) {
      return <ForgotPassword onBackToLogin={() => setIsForgot(false)} />;
    }
    if (isRegistering) {
      return <Register onLoginClick={() => setIsRegistering(false)} />;
    }
    return (
      <Login
        onRegisterClick={() => setIsRegistering(true)}
        onForgotPasswordClick={() => setIsForgot(true)}
      />
    );
  }

  // 4. App Principal (Com usuário logado)
  return (
    <div className="app-container">
      <main className="main-content">
        {selectedMidia ? (
          <div className="player-container">
            <LiteYouTubeEmbed
              key={selectedMidia.id}
              id={getYouTubeID(selectedMidia.url_midia)}
              title={selectedMidia.titulo}
            />
            {visibleTranscriptionId === selectedMidia.id && selectedMidia.texto_transcricao && (
              <div className="transcription-overlay">
                <h3>Transcrição:</h3>
                <p>{selectedMidia.texto_transcricao}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="placeholder">
            <h2>Selecione um vídeo para reproduzir</h2>
          </div>
        )}
      </main>

      <aside className="sidebar">
        <div className="user-header">
          <h1>Gerenciador</h1>
          <div className="user-info">
            <div style={{ flex: 1, marginRight: '10px' }}>
              <p style={{ margin: 0, lineHeight: '1.3' }}>
                Olá, <strong>{user?.nome?.split(' ')[0] || 'Usuário'}</strong>.
                {' '}
                <span style={{ fontSize: '0.9rem', color: '#666', display: 'inline-block' }}>
                  bem-vindo de volta!
                </span>
              </p>
            </div>
            <button onClick={logout} className="btn-logout">Sair</button>
          </div>
        </div>
        <hr />
        <div className="search-container">
          <input type="text" placeholder="Buscar na transcrição..." className="search-bar"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <MediaForm onMidiaAdded={handleMidiaAdded} midiaToEdit={editingMidia} setEditingMidia={setEditingMidia} />
        <hr />
        <h2>Minha Playlist</h2>
        {midiasParaExibir.length === 0 && searchTerm !== '' && <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhum resultado encontrado...</p>}
        <ul className="media-list">
          {midiasParaExibir.map(midia => {
            const videoID = getYouTubeID(midia.url_midia);
            return (
              <li key={midia.id} className={`media-item ${selectedMidia?.id === midia.id ? 'active' : ''}`} onClick={() => handleSelectMidia(midia)}>
                <img src={`https://img.youtube.com/vi/${videoID}/mqdefault.jpg`} alt={midia.titulo} className="media-item-thumbnail" />
                <div className="media-item-info"><strong>{midia.titulo}</strong></div>
                <div className="media-item-actions">
                  <button className={`btn-transcribe ${midia.texto_transcricao ? 'has-text' : ''}`} onClick={(e) => handleTranscribeClick(e, midia)} disabled={transcribingId === midia.id}>
                     {transcribingId === midia.id ? '...' : (visibleTranscriptionId === midia.id ? 'Off' : (midia.texto_transcricao ? 'On' : 'Transcrever'))}
                  </button>
                  <button className="btn-edit" onClick={(e) => { e.stopPropagation(); handleEdit(midia); }}>Editar</button>
                  <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(midia.id); }}>Apagar</button>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

export default App;
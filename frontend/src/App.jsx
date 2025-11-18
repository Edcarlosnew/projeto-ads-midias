import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import './App.css';

// Importamos o Contexto e a Tela de Login
import { AuthContext } from "./AuthContext.jsx";
import Login from "./Login.jsx";
import MediaForm from './MediaForm';

// Função auxiliar para pegar ID do YouTube
const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

function App() {
  // 1. Hooks (Tudo isso tem que ficar no topo, antes de qualquer return)
  const { user, logout } = useContext(AuthContext);

  const [midias, setMidias] = useState([]);
  const [editingMidia, setEditingMidia] = useState(null);
  const [selectedMidia, setSelectedMidia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleTranscriptionId, setVisibleTranscriptionId] = useState(null);
  const [transcribingId, setTranscribingId] = useState(null);

  // Função de busca (movida para fora do useEffect para ser reutilizada)
  const fetchMidias = async () => {
    // Se não tiver usuário, nem tenta buscar
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:3001/midias', config);
      setMidias(response.data);
    } catch (error) {
      console.error("Erro ao buscar mídias:", error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  };

  // useEffect roda sempre que o 'user' muda
  useEffect(() => {
    if (user) {
      fetchMidias();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMidiaAdded = () => { fetchMidias(); };

  const handleDelete = async (id) => {
    if(!confirm("Tem certeza que deseja apagar?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/midias/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMidias();
      if (selectedMidia && selectedMidia.id === id) {
        setSelectedMidia(null);
      }
    } catch (error) {
      console.error(error); // Usando o erro para sumir o warning
      alert("Falha ao apagar mídia.");
    }
  };

  const handleEdit = (midia) => { setEditingMidia(midia); };

  const handleSelectMidia = (midia) => {
    setSelectedMidia(midia);
    setVisibleTranscriptionId(null);
  };

  const handleTranscribeClick = async (e, midia) => {
    e.stopPropagation();
    if (midia.texto_transcricao) {
      setVisibleTranscriptionId(currentId => currentId === midia.id ? null : midia.id);
    } else {
      setTranscribingId(midia.id);
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:3001/midias/${midia.id}/transcrever`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        await fetchMidias();
        setTranscribingId(null);
        setVisibleTranscriptionId(midia.id);
      } catch (error) {
        console.error("Erro na transcrição:", error);
        alert("Erro ao transcrever.");
        setTranscribingId(null);
      }
    }
  };

  // Lógica de filtro
  const midiasParaExibir = searchTerm.trim() === ''
    ? midias
    : midias.filter(midia =>
        midia.texto_transcricao &&
        midia.texto_transcricao.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Outro useEffect
  useEffect(() => {
    if (selectedMidia && searchTerm.trim() !== '') {
      const aindaNaLista = midiasParaExibir.find(m => m.id === selectedMidia.id);
      if (!aindaNaLista) {
        setSelectedMidia(null);
      }
    }
  }, [midiasParaExibir, selectedMidia, searchTerm]);

  if (!user) {
    return <Login />;
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Gerenciador</h1>
          <button
            onClick={logout}
            style={{ padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Sair
          </button>
        </div>

        <hr />

        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar na transcrição..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <MediaForm
          onMidiaAdded={handleMidiaAdded}
          midiaToEdit={editingMidia}
          setEditingMidia={setEditingMidia}
        />

        <hr />

        <h2>Minha Playlist</h2>
        {midiasParaExibir.length === 0 && searchTerm !== '' && (
           <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhum resultado encontrado...</p>
        )}

        <ul className="media-list">
          {midiasParaExibir.map(midia => {
            const videoID = getYouTubeID(midia.url_midia);
            const thumbnailUrl = `https://img.youtube.com/vi/${videoID}/mqdefault.jpg`;

            return (
              <li
                key={midia.id}
                className={`media-item ${selectedMidia?.id === midia.id ? 'active' : ''}`}
                onClick={() => handleSelectMidia(midia)}
              >
                <img
                  src={thumbnailUrl}
                  alt={`Thumbnail para ${midia.titulo}`}
                  className="media-item-thumbnail"
                />

                <div className="media-item-info">
                  <strong>{midia.titulo}</strong>
                </div>

                <div className="media-item-actions">
                  <button
                    className={`btn-transcribe ${midia.texto_transcricao ? 'has-text' : ''}`}
                    onClick={(e) => handleTranscribeClick(e, midia)}
                    disabled={transcribingId === midia.id}
                    title={midia.texto_transcricao ? "Ver Transcrição" : "Gerar Transcrição"}
                  >
                     {transcribingId === midia.id ? '...' : (visibleTranscriptionId === midia.id ? 'Off' : (midia.texto_transcricao ? 'On' : 'Transcrever'))}
                  </button>

                  <button className="btn-edit" onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(midia);
                  }}>Editar</button>

                  <button className="btn-delete" onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(midia.id);
                  }}>X</button>
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
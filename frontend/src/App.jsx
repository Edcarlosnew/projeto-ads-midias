/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Importa o seu ficheiro CSS
import MediaForm from './MediaForm'; // Importa o seu componente de formulário
import LiteYouTubeEmbed from 'react-lite-youtube-embed'; // A sua biblioteca original
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'; // CSS da biblioteca

// Função para extrair o ID do URL do YouTube
const getYouTubeID = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const vParam = urlObj.searchParams.get('v');
    if (vParam) return vParam;
    
    // Lógica alternativa para URLs curtas (ex: youtu.be/...)
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch (error) {
    console.error("URL do YouTube inválida:", url, error);
    return null;
  }
};

function App() {
  const [midias, setMidias] = useState([]);
  const [editingMidia, setEditingMidia] = useState(null);
  const [selectedMidia, setSelectedMidia] = useState(null);
  const [transcribingId, setTranscribingId] = useState(null);
  const [visibleTranscriptionId, setVisibleTranscriptionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [backendStatus, setBackendStatus] = useState('pending'); // 'pending', 'online', 'offline'

  const fetchMidias = async () => {
    setBackendStatus('pending'); // Mostra 'A ligar...'
    try {
      const response = await axios.get('http://localhost:3001/midias');
      setMidias(response.data);
      setBackendStatus('online'); // Sucesso
    } catch (error) { 
      console.error("Erro ao buscar mídias:", error); 
      setBackendStatus('offline'); // Erro (Network Error)
    }
  };
  
  useEffect(() => { fetchMidias(); }, []);

  const handleMidiaAdded = () => { fetchMidias(); };
  const handleMidiaUpdated = () => { setEditingMidia(null); fetchMidias(); };
  
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Tem a certeza que deseja apagar esta mídia?")) {
      try {
        await axios.delete(`http://localhost:3001/midias/${id}`);
        fetchMidias();
        if (selectedMidia && selectedMidia.id === id) setSelectedMidia(null);
      } catch (error) { 
        alert("Falha ao apagar mídia.");
        console.error("Erro ao apagar mídia:", error); 
      }
    }
  };

  const handleEdit = (e, midia) => { 
    e.stopPropagation(); 
    setEditingMidia(midia); 
  };

  const handleTranscribeClick = async (e, midia) => {
  e.stopPropagation();

  // 1. Se o texto já existe, apenas mostra/esconde (lógica antiga)
  if (midia.texto_transcricao) {
    setVisibleTranscriptionId(currentId => currentId === midia.id ? null : midia.id);
  } else {
    // 2. Se não existe, executa a chamada POST
    setTranscribingId(midia.id);
    try {
      // 3. Chama o POST e (IMPORTANTE) guarda a resposta
      const response = await axios.post(`http://localhost:3001/midias/${midia.id}/transcrever`);
      
      // 4. Pega a nova transcrição que o backend enviou na resposta
      // (Baseado no nosso index.js: res.json({ ..., transcription: textoTranscribed }))
      const newTranscription = response.data.transcription;

      // 5. Atualiza o estado 'midias' localmente (sem fazer um novo GET)
      const updatedMidiasList = midias.map(m => 
        m.id === midia.id 
          ? { ...m, texto_transcricao: newTranscription } // Atualiza só a mídia clicada
          : m // Retorna todas as outras mídias como estão
      );
      setMidias(updatedMidiasList);
      
      // 6. Atualiza o 'selectedMidia' (se for o que está a ser visto)
      if (selectedMidia && selectedMidia.id === midia.id) {
        setSelectedMidia(prev => ({ ...prev, texto_transcricao: newTranscription }));
      }
      setVisibleTranscriptionId(midia.id); // Mostra a transcrição

    } catch (error) { 
      alert("Falha ao transcrever mídia."); 
      console.error("Erro ao transcrever mídia:", error);
    } finally { 
      setTranscribingId(null); 
    }
  }
};
  
  const handleSelectMidia = (midia) => { 
    setEditingMidia(null); 
    setSelectedMidia(midia); 
    setVisibleTranscriptionId(null);
  };

  // Lógica de filtragem 
  const midiasParaExibir = searchTerm.trim() === ''
    ? midias
    : midias.filter(midia =>
        midia.texto_transcricao &&
        midia.texto_transcricao.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Melhoria de UX (Passo 4): Limpar o player se o vídeo for filtrado
  useEffect(() => {
    if (selectedMidia && searchTerm.trim() !== '') {
      const isSelectedMidiaVisible = midiasParaExibir.some(midia => midia.id === selectedMidia.id);
      if (!isSelectedMidiaVisible) {
        setSelectedMidia(null);
        setVisibleTranscriptionId(null);
      }
    }
  }, [midiasParaExibir, selectedMidia, searchTerm]);

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
              <div className="transcription-area">
                <p>{selectedMidia.texto_transcricao}</p>
              </div>
            )}
            {transcribingId === selectedMidia.id && (
              <div className="transcription-status">A transcrever áudio...</div>
            )}
          </div>
        ) : (
          <div className="placeholder-text">
            <h2>Player de Mídia</h2>
            <p>Selecione um item da playlist para reproduzir.</p>
          </div>
        )}
      </main>

      <aside className="sidebar">
        <MediaForm 
          onMidiaAdded={handleMidiaAdded}
          onMidiaUpdated={handleMidiaUpdated}
          midiaToEdit={editingMidia}
          setEditingMidia={setEditingMidia} // Adicionado para limpar o form
        />
        <hr />

        {/* Indicador de Status do Backend */}
        <div className={`backend-status status-${backendStatus}`}>
          {backendStatus === 'pending' && 'A ligar ao servidor...'}
          {backendStatus === 'online' && 'Ligado ao servidor.'}
          {backendStatus === 'offline' && 'Erro de ligação. O servidor backend está desligado?'}
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar na transcrição..."
            className="search-bar"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <h2>Minha Playlist</h2>
        <ul className="media-list">
          {midiasParaExibir.map(midia => {
            const videoID = getYouTubeID(midia.url_midia);
            const thumbnailUrl = videoID 
              ? `https://img.youtube.com/vi/${videoID}/mqdefault.jpg`
              : 'https://placehold.co/100x56/eee/ccc?text=Sem+URL';

            return (
              <li 
                key={midia.id} 
                className={`media-item ${selectedMidia?.id === midia.id ? 'selected' : ''}`} 
                onClick={() => handleSelectMidia(midia)}
              >
                
                {/* Melhoria de Design: Thumbnail */}
                <img 
                  src={thumbnailUrl} 
                  alt={`Thumbnail para ${midia.titulo}`} 
                  className="media-item-thumbnail" 
                />

                <div className="media-item-info">
                <strong>{midia.titulo}</strong>
              </div>
              <div className="media-item-actions">
                <button onClick={(e) => handleEdit(e, midia)}>Editar</button>
                <button onClick={(e) => handleDelete(e, midia.id)} className="btn-delete">Apagar</button>
                <button onClick={(e) => handleTranscribeClick(e, midia)} className="btn-transcribe">
                  {midia.texto_transcricao ? `Transcrição/${visibleTranscriptionId === midia.id ? 'Off' : 'On'}` : 'Transcrever'}
                </button>
              </div>
              </li>
            );
          })}
          
          {/* Melhoria de UX (Passo 4): Mensagem "Nenhum resultado" */}
          {midiasParaExibir.length === 0 && searchTerm.length > 0 && (
            <li className="no-results-message">
              Nenhum resultado encontrado para "{searchTerm}".
            </li>
          )}

        </ul>
      </aside>
    </div>
  );
}

export default App;
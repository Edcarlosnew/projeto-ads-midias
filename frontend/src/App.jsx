import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MediaForm from './MediaForm';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

// Função para extrair o ID do URL do YouTube
const getYouTubeID = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
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

  const fetchMidias = async () => {
    try {
      const response = await axios.get('http://localhost:3001/midias');
      setMidias(response.data);
    } catch (error) { console.error("Erro ao buscar mídias:", error); }
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
      } catch (error) { alert("Falha ao apagar mídia."); console.error("Erro ao apagar mídia:", error); }
    }
  };

  const handleEdit = (e, midia) => { 
    e.stopPropagation(); 
    setEditingMidia(midia); 
  };

  const handleTranscribe = async (e, id) => {
    e.stopPropagation();
    setTranscribingId(id);
    try {
      await axios.post(`http://localhost:3001/midias/${id}/transcrever`);
      const response = await axios.get('http://localhost:3001/midias');
      setMidias(response.data);
      if (selectedMidia && selectedMidia.id === id) {
        const updatedMidia = response.data.find(m => m.id === id);
        setSelectedMidia(updatedMidia);
      }
    } catch (error) { alert("Falha ao transcrever mídia."); console.error("Erro ao transcrever mídia:", error); } 
    finally { setTranscribingId(null); }
  };
  
  const handleSelectMidia = (midia) => { 
    setEditingMidia(null); 
    setSelectedMidia(midia); 
  };

  return (
    <div className="app-container">
      <main className="main-content">
        {selectedMidia ? (
          <>
            <div className="player-container">
              <LiteYouTubeEmbed
                id={getYouTubeID(selectedMidia.url_midia)}
                title={selectedMidia.titulo}
              />
            </div>
            
            <h2>{selectedMidia.titulo}</h2>

            {selectedMidia.texto_transcricao && (
              <div className="transcription-area">
                <h3>Transcrição:</h3>
                <p>{selectedMidia.texto_transcricao}</p>
              </div>
            )}
            {transcribingId === selectedMidia.id && (<p>A transcrever áudio...</p>)}
          </>
        ) : (
          <div>
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
        />
        <hr />
        <h2>Minha Playlist</h2>
        <ul className="media-list">
          {midias.map(midia => (
            <li key={midia.id} className="media-item" onClick={() => handleSelectMidia(midia)}>
              <div className="media-item-info">
                <strong>{midia.titulo}</strong>
                <span>{midia.url_midia}</span>
              </div>
              <div className="media-item-actions">
                <button onClick={(e) => handleEdit(e, midia)}>Editar</button>
                <button onClick={(e) => handleDelete(e, midia.id)} className="btn-delete">Apagar</button>
                {!midia.texto_transcricao && (
                  <button onClick={(e) => handleTranscribe(e, midia.id)} className="btn-transcribe">
                    {transcribingId === midia.id ? '...' : 'Transcrever'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export default App;
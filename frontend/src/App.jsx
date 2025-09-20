import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MediaForm from './MediaForm';

function App() {
  const [midias, setMidias] = useState([]);
  const [editingMidia, setEditingMidia] = useState(null);
  const [transcribingId, setTranscribingId] = useState(null);

  const fetchMidias = async () => {
    try {
      const response = await axios.get('http://localhost:3001/midias');
      setMidias(response.data);
    } catch (error) {
      console.error("Erro ao buscar mídias:", error);
    }
  };

  useEffect(() => { fetchMidias(); }, []);

  // --- FUNÇÕES ATUALIZADAS ---
  // Todas agora chamam fetchMidias() para garantir consistência.

  const handleMidiaAdded = () => {
    fetchMidias();
  };

  const handleMidiaUpdated = () => {
    setEditingMidia(null);
    fetchMidias();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/midias/${id}`);
      fetchMidias();
    } catch (error) {
      alert("Falha ao apagar mídia.");
      console.error("Falha ao apagar mídia:", error);
    }
  };

  const handleTranscribe = async (id) => {
    setTranscribingId(id);
    try {
      await axios.post(`http://localhost:3001/midias/${id}/transcrever`);
      fetchMidias(); // SIMPLIFICADO: Apenas busca a lista atualizada.
    } catch (error) {
      alert("Falha ao transcrever mídia.");
      console.error("Erro na transcrição:", error);
    } finally {
      setTranscribingId(null);
    }
  };

  const handleEdit = (midia) => {
    setEditingMidia(midia);
  };

  return (
    <div className="App">
      <h1>Projeto Mídias</h1>
      <hr />
      <MediaForm
        onMidiaAdded={handleMidiaAdded}
        onMidiaUpdated={handleMidiaUpdated}
        midiaToEdit={editingMidia}
      />
      <hr />
      <div>
        <h2>Minha Lista de Mídias</h2>
        <ul>
          {midias.map(midia => (
            midia && ( // Adicionada uma verificação de segurança
              <li key={midia.id}>
                <div className="midia-header">
                  <div className="midia-info">
                    <strong>{midia.titulo}</strong>
                    <span>{midia.url_midia}</span>
                  </div>
                  <div className="midia-actions">
                    <button className="btn-edit" onClick={() => handleEdit(midia)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleDelete(midia.id)}>Apagar</button>
                    {!midia.texto_transcricao && transcribingId !== midia.id && (
                      <button 
                        className="btn-transcribe" 
                        onClick={() => handleTranscribe(midia.id)}
                      >
                        Transcrever
                      </button>
                    )}
                  </div>
                </div>
                {transcribingId === midia.id && (
                  <div className="loading-indicator">A transcrever...</div>
                )}
                {midia.texto_transcricao && (
                  <div className="transcricao-texto">
                    {midia.texto_transcricao}
                  </div>
                )}
              </li>
            )
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

















/*
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MediaForm from './MediaForm';

function App() {
  const [midias, setMidias] = useState([]);
  // Este estado vai guardar os dados da mídia que estamos editando.
  // Começa como 'nulo', significando que não estamos editando nada.
  const [editingMidia, setEditingMidia] = useState(null);

  const fetchMidias = async () => {
    try {
      const response = await axios.get('http://localhost:3001/midias');
      setMidias(response.data);
    } catch (error) {
      console.error("Erro ao buscar mídias:", error);
    }
  };

  useEffect(() => {
    fetchMidias();
  }, []);

  const handleMidiaAdded = () => {
    fetchMidias();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/midias/${id}`);
      fetchMidias();
    } catch (error) {
      console.error("Erro ao apagar mídia:", error);
      alert("Falha ao apagar mídia.");
    }
  };

  // Esta função é chamada quando clicamos no botão "Editar" de um item.
  // Ela pega os dados da mídia clicada e os coloca no nosso estado 'editingMidia'.
  const handleEdit = (midia) => {
    setEditingMidia(midia);
  };

  return (
    <div className="App">
      <h1>Projeto Mídias</h1>
      <hr />
      { /*Passamos o estado de edição e a função para limpá-lo para o formulário*/ /*}
*  <MediaForm 
        onMidiaAdded={handleMidiaAdded} 
        midiaToEdit={editingMidia}
        setEditingMidia={setEditingMidia}
      />
      <hr />
      <div>
        <h2>Minha Lista de Mídias</h2>
        <ul>
          {midias.map(midia => (
            <li key={midia.id}>
  <div className="midia-info">
    <strong>{midia.titulo}</strong>
    <span>{midia.url_midia}</span>
  </div>
  <div className="midia-actions">
    <button className="btn-delete" onClick={() => handleDelete(midia.id)}>Apagar</button>
    <button className="btn-edit" onClick={() => handleEdit(midia)}>Editar</button>
  </div>
</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
*/
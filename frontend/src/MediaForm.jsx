import { useState, useEffect } from 'react';
import axios from 'axios';

function MediaForm({ onMidiaAdded, midiaToEdit, setEditingMidia }) {
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (midiaToEdit) {
      setTitulo(midiaToEdit.titulo);
      setUrl(midiaToEdit.url_midia);
    } else {
      setTitulo('');
      setUrl('');
    }
  }, [midiaToEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const midiaData = { titulo: titulo, url_midia: url };

    try {
      // ▼▼▼ PEGAR O TOKEN DO NAVEGADOR ▼▼▼
      const token = localStorage.getItem('token');

      // Configurar o cabeçalho com o Token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (midiaToEdit) {
        // ▼▼▼ ENVIAR O TOKEN NA EDIÇÃO (PUT) ▼▼▼
        await axios.put(
          `http://localhost:3001/midias/${midiaToEdit.id}`,
          midiaData,
          config // <--- Token aqui
        );
        setEditingMidia(null);
      } else {
        // ▼▼▼ ENVIAR O TOKEN NA CRIAÇÃO (POST) ▼▼▼
        await axios.post(
          'http://localhost:3001/midias',
          midiaData,
          config // <--- Token aqui
        );
      }

      // Limpa o formulário e avisa o App para atualizar a lista
      setTitulo('');
      setUrl('');
      onMidiaAdded();

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha ao salvar mídia. Verifique se você está logado.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{midiaToEdit ? 'Editar Mídia' : 'Adicionar Nova Mídia'}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>URL:</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <button type="submit" style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#1877f2',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          {midiaToEdit ? 'Salvar Alterações' : 'Adicionar'}
        </button>

        {midiaToEdit && (
          <button
            type="button"
            onClick={() => {
              setEditingMidia(null);
              setTitulo('');
              setUrl('');
            }}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '8px',
              backgroundColor: '#ccc',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancelar Edição
          </button>
        )}
      </div>
    </form>
  );
}

export default MediaForm;
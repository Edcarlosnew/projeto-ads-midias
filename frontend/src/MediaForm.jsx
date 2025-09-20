import { useState, useEffect } from 'react';
import axios from 'axios';

function MediaForm({ onMidiaAdded, midiaToEdit, onMidiaUpdated }) { 
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
      if (midiaToEdit) {
        // SE estamos em modo de edição, fazemos um PUT para atualizar
        await axios.put(`http://localhost:3001/midias/${midiaToEdit.id}`, midiaData);
        onMidiaUpdated(); // Avisa o App.jsx que terminamos a edição
      } else {
        // SE NÃO, fazemos um POST para criar um novo item
        await axios.post('http://localhost:3001/midias', midiaData);
        onMidiaAdded(); // AGORA NO SÍTIO CERTO: Avisa o App.jsx que terminamos de adicionar
      }
    } catch (error) {
      console.error("Erro ao salvar mídia:", error);
      alert("Falha ao salvar mídia.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{midiaToEdit ? 'Editar Mídia' : 'Adicionar Nova Mídia'}</h2>
      <div>
        <label>Título:</label>
        <input 
          type="text" 
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required 
        />
      </div>
      <div>
        <label>URL:</label>
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      <button type="submit">{midiaToEdit ? 'Salvar Alterações' : 'Adicionar'}</button>
    </form>
  );
}

export default MediaForm;
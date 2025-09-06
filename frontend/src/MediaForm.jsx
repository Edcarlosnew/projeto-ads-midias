import { useState, useEffect } from 'react'; // Adicionamos o useEffect
import axios from 'axios';

// Agora recebemos as novas props que passamos do App.jsx
function MediaForm({ onMidiaAdded, midiaToEdit, setEditingMidia }) { 
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');

  // Este useEffect "assiste" a prop midiaToEdit.
  // Toda vez que ela mudar (quando clicarmos em "Editar" no App.jsx), este código roda.
  useEffect(() => {
    if (midiaToEdit) {
      // Se existe uma mídia para editar, preenchemos os campos do formulário com seus dados
      setTitulo(midiaToEdit.titulo);
      setUrl(midiaToEdit.url_midia);
    } else {
      // Se não (se midiaToEdit for nulo), limpamos os campos do formulário
      setTitulo('');
      setUrl('');
    }
  }, [midiaToEdit]); // O array no final diz ao useEffect para rodar de novo SÓ se 'midiaToEdit' mudar

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const midiaData = { titulo: titulo, url_midia: url };

    try {
      if (midiaToEdit) {
        // SE estamos em modo de edição, fazemos um PUT para atualizar
        await axios.put(`http://localhost:3001/midias/${midiaToEdit.id}`, midiaData);
        setEditingMidia(null); // Avisa o App.jsx que terminamos a edição
      } else {
        // SE NÃO, fazemos um POST para criar um novo item (como antes)
        await axios.post('http://localhost:3001/midias', midiaData);
      }

      onMidiaAdded(); // Atualiza a lista de mídias no App.jsx
      
    } catch (error) {
      console.error("Erro ao salvar mídia:", error);
      alert("Falha ao salvar mídia.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* O título do formulário agora muda dependendo se estamos editando ou não */}
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
      {/* O texto do botão também muda */}
      <button type="submit">{midiaToEdit ? 'Salvar Alterações' : 'Adicionar'}</button>
    </form>
  );
}

export default MediaForm;
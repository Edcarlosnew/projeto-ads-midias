import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MediaForm from './MediaForm';

function App() {
  const [midias, setMidias] = useState([]);
  // --- ESTADO NOVO ABAIXO ---
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

  // --- FUNÇÃO NOVA ABAIXO ---
  // Esta função é chamada quando clicamos no botão "Editar" de um item.
  // Ela pega os dados da mídia clicada e os coloca no nosso estado 'editingMidia'.
  const handleEdit = (midia) => {
    setEditingMidia(midia);
  };

  return (
    <div className="App">
      <h1>Projeto Mídias</h1>
      <hr />
      {/* Passamos o estado de edição e a função para limpá-lo para o formulário */}
      <MediaForm 
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
    <strong>{midia.titulo}</strong>: <span>{midia.url_midia}</span>
    <div>
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
import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const response = await axios.get('http://localhost:3001/admin/stats', config);
        setStats(response.data);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar dados. Você tem permissão de admin?');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="admin-container"><h2>Carregando dados...</h2></div>;
  if (error) return <div className="admin-container"><h2 className="error-text">{error}</h2><button onClick={onBack}>Voltar</button></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Painel Administrativo</h1>
        <button onClick={onBack} className="btn-back">Voltar para Playlist</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total de Usuários</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>

        <div className="stat-card active">
          <h3>Usuários Ativos</h3>
          <p className="stat-number">{stats.activeUsers}</p>
        </div>

        <div className="stat-card pending">
          <h3>Pendentes (Não verificado)</h3>
          <p className="stat-number">{stats.pendingUsers}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
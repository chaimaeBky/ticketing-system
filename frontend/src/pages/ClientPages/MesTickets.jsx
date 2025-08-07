import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarClient from '../../components/NavBarClient';
import '../../ClientCSS/Dashboard.css';
import '../../background.css';
import TicketCard from '../../components/TicketCard';


const MesTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Handler pour la déconnexion
  const handleLogout = () => {
    navigate('/login');
  };

  // Récupération des tickets au chargement
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // TODO: Remplacer par l'ID de l'utilisateur connecté
      // Pour l'instant, on récupère tous les tickets
      const response = await fetch('http://localhost:5000/api/tickets');
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets);
      } else {
        setError('Erreur lors de la récupération des tickets');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir la couleur du badge selon l'état
  const getStatusColor = (etat) => {
    switch (etat?.toUpperCase()) {
      case 'OUVERT':
        return 'bg-blue-100 text-blue-800';
      case 'EN_COURS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLU':
        return 'bg-green-100 text-green-800';
      case 'FERME':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Navigation vers les détails du ticket
  const handleTicketClick = (ticketId) => {
    navigate(`/client/ticket/${ticketId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dashboard-container bg-custom">
        <NavBarClient onLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto"></div>
            <p className="text-gray-600 mt-4">Chargement des tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dashboard-container bg-custom">
      {/* Background pattern */}
      <div className="dashboard-background">
        <div className="map-pattern"></div>
        <div className="map-shape map-shape-1"></div>
        <div className="map-shape map-shape-2"></div>
        <div className="map-shape map-shape-3"></div>
      </div>

      {/* Navigation */}
      <NavBarClient onLogout={handleLogout} />

      {/* Main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-800 mb-2">
            Mes tickets
          </h1>
          <p className="text-2xl font-bold text-gray-600 mb-1">
            Consultez l'historique de vos demandes et réclamations
          </p>
        </div>
         
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des tickets */}
        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun ticket trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore créé de ticket.
            </p>
            <button 
              onClick={() => navigate('/client/create-ticket')}
              className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors font-medium"
            >
              Créer un ticket
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket) => (
  <TicketCard
    key={ticket.id}
    ticket={ticket}
    onViewDetails={handleTicketClick}
  />
))}

          </div>
        )}
      </main>
    </div>
  );
};

export default MesTickets;
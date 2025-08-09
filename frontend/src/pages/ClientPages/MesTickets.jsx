import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarClient from '../../components/NavBarClient';
import '../../ClientCSS/Dashboard.css';
import '../../background.css';
import TicketCard from '../../components/TicketCard';

const MesTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    sujet: '',
    etat: ''
  });

  // Options pour les filtres basées sur le schéma
  const sujets = [
    { value: '', label: 'Tous les sujets' },
    { value: 'livraison', label: 'Livraison' },
    { value: 'paiement', label: 'Paiement' },
    { value: 'bug', label: 'Bug' },
    { value: 'retour', label: 'Retour' },
    { value: 'autre', label: 'Autre' }
  ];

  const etats = [
    { value: '', label: 'Tous les états' },
    { value: 'OUVERT', label: 'Ouvert' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'RESOLU', label: 'Résolu' },
    { value: 'FERME', label: 'Fermé' }
  ];

  // Handler pour la déconnexion
  const handleLogout = () => {
    navigate('/login');
  };

  // Récupération des tickets au chargement
  useEffect(() => {
    fetchTickets();
  }, []);

  // Effet pour appliquer les filtres
  useEffect(() => {
    applyFilters();
  }, [tickets, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log("Utilisateur connecté :", user);
      console.log("ID du client :", user?.id);
      
      const clientId = user?.id;

      if (!clientId) {
        setError('Utilisateur non connecté');
        return;
      }

      console.log("URL appelée :", `http://localhost:5000/api/tickets/client/${clientId}`);
      
      const response = await fetch(`http://localhost:5000/api/tickets/client/${clientId}`);
      console.log("Status de la réponse :", response.status);
      console.log("Response OK :", response.ok);
      
      const data = await response.json();
      console.log("Données reçues :", data);

      if (data.success) {
        setTickets(data.tickets);
        console.log("Tickets mis à jour dans le state");
      } else {
        console.log("Erreur dans la réponse :", data);
        setError('Erreur lors de la récupération des tickets');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    let filtered = [...tickets];

    // Filtre par sujet
    if (filters.sujet) {
      filtered = filtered.filter(ticket => 
        ticket.sujet?.toLowerCase() === filters.sujet.toLowerCase()
      );
    }

    // Filtre par état
    if (filters.etat) {
      filtered = filtered.filter(ticket => 
        ticket.etat?.toUpperCase() === filters.etat.toUpperCase()
      );
    }

    setFilteredTickets(filtered);
  };

  // Handler pour les changements de filtres
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      sujet: '',
      etat: ''
    });
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
      <div className="min-h-screen dashboard-container bg-custom">
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
    <div className="min-h-screen dashboard-container bg-custom">
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
          <p className="text-xl font-bold text-gray-600 mb-1">
            Consultez l'historique de vos demandes et réclamations
          </p>
        </div>

         {/* Barre de filtres */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {/* Filtre par sujet */}
            <div className="relative">
              <select
                id="sujet-filter"
                value={filters.sujet}
                onChange={(e) => handleFilterChange('sujet', e.target.value)}
                className="appearance-none border border-black rounded-lg px-4 py-3 pr-10 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-[180px] shadow-sm"
              >
                {sujets.map(sujet => (
                  <option key={sujet.value} value={sujet.value}>
                    {sujet.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            {/* Filtre par état */}
            <div className="relative">
              <select
                id="etat-filter"
                value={filters.etat}
                onChange={(e) => handleFilterChange('etat', e.target.value)}
                className="appearance-none border border-black rounded-lg px-4 py-3 pr-10 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-[180px] shadow-sm"
              >
                {etats.map(etat => (
                  <option key={etat.value} value={etat.value}>
                    {etat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            {/* Bouton de réinitialisation */}
            {(filters.sujet || filters.etat) && (
              <button
                onClick={resetFilters}
                className="border border-black rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-200 hover:bg-opacity-20 transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Réinitialiser
              </button>
            )}
          </div>

          {/* Indicateurs de filtres actifs */}
          {(filters.sujet || filters.etat) && (
            <div className="mt-4 flex flex-wrap gap-2 items-center justify-center">
              {filters.sujet && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs text-blue-700 border border-black">
                  Sujet: {sujets.find(s => s.value === filters.sujet)?.label}
                  <button
                    onClick={() => handleFilterChange('sujet', '')}
                    className="ml-2 text-blue-700 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.etat && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs text-green-700 border border-black">
                  État: {etats.find(e => e.value === filters.etat)?.label}
                  <button
                    onClick={() => handleFilterChange('etat', '')}
                    className="ml-2 text-green-700 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
         
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Compteur de résultats */}
        {/* {!loading && tickets.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredTickets.length} ticket{filteredTickets.length > 1 ? 's' : ''} 
              {filteredTickets.length !== tickets.length && ` sur ${tickets.length}`}
            </p>
          </div>
        )} */}

        {/* Liste des tickets */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tickets.length === 0 ? 'Aucun ticket trouvé' : 'Aucun ticket ne correspond aux filtres'}
            </h3>
            <p className="text-gray-600 mb-4">
              {tickets.length === 0 
                ? 'Vous n\'avez pas encore créé de ticket.'
                : 'Essayez de modifier vos critères de recherche.'
              }
            </p>
            {tickets.length === 0 ? (
              <button 
                onClick={() => navigate('/client/create-ticket')}
                className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors font-medium"
              >
                Créer un ticket
              </button>
            ) : (
              <button 
                onClick={resetFilters}
                className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTickets.map((ticket) => (
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
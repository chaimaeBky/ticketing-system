import React, { useState, useEffect } from 'react';
import NavBarClient from '../../components/NavBarClient';
import TicketCard from '../../components/TicketCard';
import '../../ClientCSS/Dashboard.css';
import '../../background.css';
import { useNavigate, useLocation } from 'react-router-dom';


const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tickets from backend
 // Dans le useEffect de Dashboard.js
// Sortir fetchTickets du useEffect et la mettre AVANT
const fetchTickets = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const clientId = user?.id;
    
    if (!clientId) {
      console.error('Utilisateur non connecté');
      navigate('/login');
      return;
    }
    
    const response = await fetch(`http://localhost:5000/api/tickets/client/${clientId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
      setTickets(data.tickets || []);
    } else {
      console.error('Erreur API:', data.error);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des tickets:', error);
  } finally {
    setLoading(false);
  }
};

// useEffect simplifié
useEffect(() => {
  setLoading(true);
  fetchTickets();
}, [location.key]); // Ajouter location.key ici au lieu de []

  const recentTickets = tickets.slice(0, 2);

 const handleNewTicket = () => {
  navigate('/client/create-ticket');
};

 const handleLogout = () => {
  localStorage.removeItem('user');
  navigate('/login');
};

  const handleViewDetails = (ticketId) => {
  navigate(`/client/ticket/${ticketId}`);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBarClient onNewTicket={handleNewTicket} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  dashboard-container bg-custom">
      {/* Background pattern */}
      <div className="dashboard-background">
        <div className="map-pattern"></div>
        <div className="map-shape map-shape-1"></div>
        <div className="map-shape map-shape-2"></div>
        <div className="map-shape map-shape-3"></div>
      </div>

      {/* Navigation */}
      <NavBarClient onNewTicket={handleNewTicket} onLogout={handleLogout} />

      {/* Main content - Centré */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="w-full max-w-4xl">
          {/* Compteur de tickets centré */}
          <div className="text-center mb-8">
            
            <h2 className="text-2xl font-medium text-gray-700 mb-2">
              Nombre total de tickets :
            </h2>
            <div className="text-5xl font-bold text-red-800">
              {tickets.length}
            </div>
          </div>

{/* Section tickets récents avec layout horizontal */}
<div className="mb-8">
  <div className="flex items-start gap-6">
    {/* Titre à gauche */}
    <div className="flex-shrink-0 pt-2">
      <h2 className="text-xl font-semibold text-gray-800">
        Les tickets récents :
      </h2>
    </div>
    
            {/* Liste des tickets à droite */}
            <div className="flex-1 space-y-4">
              {recentTickets.length > 0 ? (
          recentTickets.map((ticket, index) => (
            <div key={ticket.id}>
              <TicketCard
                ticket={ticket}
                index={index} // 👈 Ajouter l'index ici
                onViewDetails={handleViewDetails}
              />
            </div>
          ))
        ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-500">Aucun ticket trouvé</p>
        </div>
      )}
    </div>
  </div>
</div>

          {/* Bouton centré */}
          <div className="text-center">
            <button 
              onClick={handleNewTicket}
              className="bg-red-800 text-white px-8 py-3 rounded-lg hover:bg-red-900 transition-colors font-medium text-lg shadow-lg"
            >
              Créer nouveau ticket
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
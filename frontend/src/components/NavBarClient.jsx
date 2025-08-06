import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Import du logo
import logo from '../assets/images/logo.jpg'; // Ajuste le chemin selon ta structure

const NavBarClient = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Fonction pour déterminer si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Fonction pour obtenir la classe CSS selon l'état actif
  const getLinkClass = (path) => {
    return isActive(path) 
      ? "text-red-800 font-medium transition-colors" 
      : "text-gray-700 hover:text-gray-900 font-medium transition-colors";
  };

  // Handlers pour la navigation
  const handleAccueil = () => {
    navigate('/client/dashboard');
  };

  const handleMesTickets = () => {
    navigate('/client/mes-tickets');
  };

  const handleNouveauTicket = () => {
    navigate('/client/create-ticket');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          
          {/* Navigation gauche */}
          <div className="flex items-center space-x-20 flex-1">
            <button 
              onClick={handleAccueil}
              className={getLinkClass('/client/dashboard')}
            >
              Accueil
            </button>
            <button 
              onClick={handleMesTickets}
              className={getLinkClass('/client/mes-tickets')}
            >
              Mes tickets
            </button>
          </div>
          
          {/* Logo centré */}
          <div className="flex-1 flex justify-center">
            <img
              src={logo}
              alt="TIRIO Logistics and Transport"
              className="h-12 w-auto cursor-pointer"
              onClick={handleAccueil}
            />
          </div>
          
          {/* Boutons droite */}
          <div className="flex items-center space-x-20 flex-1 justify-end">
            <button 
              onClick={handleNouveauTicket}
              className={getLinkClass('/client/create-ticket')}
            >
              Nouveau ticket
            </button>
            <button 
              onClick={onLogout}
              className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition-colors font-medium"
            >
              Déconnexion
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavBarClient;
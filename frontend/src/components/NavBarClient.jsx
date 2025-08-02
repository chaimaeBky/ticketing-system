import React from 'react';
// Import du logo
import logo from '../assets/images/logo.jpg'; // Ajuste le chemin selon ta structure

const NavBarClient = ({ onNewTicket, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          
          {/* Navigation gauche */}
          <div className="flex items-center space-x-20 flex-1">
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Accueil
            </button>
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Mes tickets
            </button>
          </div>
          
          {/* Logo centré */}
          <div className="flex-1 flex justify-center">
            <img
              src={logo} // Utilise l'import
              alt="TIRIO Logistics and Transport"
              className="h-12 w-auto" // Hauteur fixe, largeur auto
            />
          </div>
          
          {/* Boutons droite */}
          <div className="flex items-center space-x-20 flex-1 justify-end">
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Nouveau ticket
            </button>
            {/* <button 
              onClick={onNewTicket}
              className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition-colors font-medium"
            >
              Nouveau ticket
            </button> */}
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
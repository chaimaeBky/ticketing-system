import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.jpg';
import '../index.css';

const NavBarClient = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Fonction pour obtenir la classe CSS selon l'état actif (même style qu'AdminMenu)
  const linkClass = (path) =>
    `px-4 py-2 transition-colors duration-200 text-lg ${
      pathname === path
        ? "font-bold text-[#8f1630]"
        : "font-normal text-black hover:text-[#a83b52]"
    }`;

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

  const logOut = () => {
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md py-2 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Navigation gauche */}
        <ul className="flex items-center gap-10">
          <li>
            <a 
              href="/client/dashboard"
              onClick={(e) => {
                e.preventDefault();
                handleAccueil();
              }}
              className={linkClass('/client/dashboard')}
            >
              Accueil
            </a>
          </li>
          <li>
            <a 
              href="/client/mes-tickets"
              onClick={(e) => {
                e.preventDefault();
                handleMesTickets();
              }}
              className={linkClass('/client/mes-tickets')}
            >
              Mes tickets
            </a>
          </li>
        </ul>

        {/* Logo centré */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-auto"
            onClick={handleAccueil}
          />
        </div>

        {/* Navigation droite */}
        <ul className="flex items-center gap-12">
          <li>
            <a 
              href="/client/create-ticket"
              onClick={(e) => {
                e.preventDefault();
                handleNouveauTicket();
              }}
              className={linkClass('/client/create-ticket')}
            >
              Nouveau ticket
            </a>
          </li>
          <li className="ml-8">
            <button
              type="button"
              style={{ backgroundColor: "#8f1630" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#a83b52")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#8f1630")}
              onClick={logOut}
              className="text-white px-4 py-2 rounded font-semibold transition text-md"
            >
              Déconnexion
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBarClient;
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../index.css';

const AdminMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const logOut = () => {
    navigate('/');
  };

  const linkClass = (path) =>
    `px-4 py-2 transition-colors duration-200 text-lg ${
      pathname === path
        ? "font-bold text-[#8f1630]"
        : "font-normal text-black hover:text-[#a83b52]"
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md py-2 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        <ul className="flex items-center gap-10">
          <li><a href="/admin" className={linkClass("/admin")}>Accueil</a></li>
          <li><a href="/ticketsAdmin" className={linkClass("/ticketsAdmin")}>Tickets</a></li>
          <li><a href="/statistiques" className={linkClass("/statistiques")}>Statistiques</a></li>
        </ul>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img
            src="../src/assets/images/logo.png"
            alt="Logo"
            className="h-10 w-auto"
          />
        </div>

        <ul className="flex items-center gap-12">
          <li><a href="/UtilisateurAdmin" className={linkClass("/UtilisateurAdmin")}>Utilisateurs</a></li>
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

export default AdminMenu;
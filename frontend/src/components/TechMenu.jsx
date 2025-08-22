import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance"; // à installer si ce n'est pas déjà fait
import '../index.css';

const TechMenu = () => {
  const navigate = useNavigate();

  const logOut = async () => {
    try {
      // Appel au backend pour supprimer la session
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });

      // Supprimer les infos locales
      localStorage.removeItem('user');
      localStorage.removeItem('user_id');

      // Redirection vers login
      navigate('/');
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md py-2 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img
            src="../src/assets/images/logo.png"
            alt="Logo"
            className="h-10 w-auto"
          />
        </div>

        <ul className="flex items-center gap-12">
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

export default TechMenu;

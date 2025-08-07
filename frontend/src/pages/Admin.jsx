import React from "react";
import { useNavigate} from "react-router-dom";
import AdminMenu from "../components/AdminMenu";
import TotalTickets from "../components/TotalTickets";
import DureeMoyenne from "../components/DureeMoyenneResolution";
import TicketStati from "../components/TicketStati";
import "../background.css"; 

const Admin = () => {

  const navigate = useNavigate();

  const utilisateur = () => {
    navigate('/UtilisateurAdmin');
  }
  const tickets = () => {
    navigate('/ticketsAdmin');
  }
  return (
    
    <div className="min-h-screen w-full pt-24">
      
      <AdminMenu />
      <div className="w-full flex justify-center ">
        <TotalTickets />
      
        <TicketStati />
       
        <DureeMoyenne />

      </div>

      <div className="w-full flex  justify-center mt-20">
        <ul className="flex items-center gap-12">
          <li className="ml-8">
            <button
              type="button"
              style={{ backgroundColor: "#8f1630" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#a83b52")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#8f1630")}
              onClick={utilisateur}
              className="text-white px-4 py-2 mb-30 rounded font-semibold transition text-md"
            >
              Gérer les utilisateurs 
            </button>
          </li>
          <li className="ml-8">
            <button
              type="button"
              style={{ backgroundColor: "#8f1630" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#a83b52")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#8f1630")}
              onClick={tickets}
              className="text-white px-4 mb-30 py-2 rounded font-semibold transition text-md"
            >
              Voir tous les tickets
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Admin;

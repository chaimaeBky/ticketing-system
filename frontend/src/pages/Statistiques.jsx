import React from "react";
import { useNavigate} from "react-router-dom";
import AdminMenu from "../components/AdminMenu";
import TotalTickets from "../components/TotalTickets";
import DureeMoyenne from "../components/DureeMoyenneResolution";
import TicketStati from "../components/TicketStati";
import TicketsParMois from "../components/TicketsParMois";
import TechnicianPerformance from "../components/TechnicianPerformance";
import "../background.css"; 

const Statistiques = () => {
    
return (
  <div className="min-h-screen w-full pt-24">
      
      <AdminMenu />

       <TicketsParMois />
              <TechnicianPerformance />


      <div className="w-full flex justify-center ">
         
        <TotalTickets />
      
        <TicketStati />
      
        <DureeMoyenne />
   
       </div>
     
  </div>
)
};
export default Statistiques ;
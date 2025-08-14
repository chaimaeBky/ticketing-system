import React  from "react";
import TechMenu from "../components/TechMenu";
import TicketsTabTech from "../components/ticketsTabTech";
import "../background.css";



const Technicien= () => {
    
return (
  <div className="min-h-screen  mb-30w-full pt-20">
      <TechMenu />
      <div className="w-full flex  justify-center ">
        <TicketsTabTech/>
      
        
      </div>
  </div>
)
};
export default Technicien ;
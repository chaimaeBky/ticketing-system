import React  from "react";
import AdminMenu from "../components/AdminMenu";
import TicketsTabAdmin from "../components/ticketsTabAdmin";
import "../background.css";



const TicketsAdmin= () => {
    
return (
  <div className="min-h-screen  mb-30w-full pt-20">
      <AdminMenu />
      <div className="w-full flex  justify-center ">
        <TicketsTabAdmin />
      
        
      </div>
  </div>
)
};
export default TicketsAdmin ;
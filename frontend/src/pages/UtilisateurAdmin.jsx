import React , { useState } from "react";
import AdminMenu from "../components/AdminMenu";
import UsersTabAdmin from "../components/UsersTabAdmin";
import "../background.css";



const UtilisateurAdmin = () => {
    
return (
  <div className="min-h-screen   w-full">

     <AdminMenu/>
     <UsersTabAdmin/>
     
  </div>
)
};
export default UtilisateurAdmin ;
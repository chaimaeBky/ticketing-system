import React from 'react'
import './index.css';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';

import Login from './pages/login';
import Register from './pages/Register';
import Client from './pages/Client';
import Technicien from './pages/Technicien';
import Admin from './pages/Admin';
import Statistiques from './pages/Statistiques';
import TicketsAdmin from './pages/TicketsAdmin';
import UtilisateurAdmin from './pages/UtilisateurAdmin';
import ModifierUtilisateur from "./pages/ModifierUtilisateur";
import AjouterUtilisateurAdmin from './pages/AjouterUtilisateurAdmin';




const App = () => {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path='/' element={<Login/>} /> 
        <Route path='/register' element={<Register/>} /> 
        <Route path='/client' element={<Client/>} /> 
        <Route path='/admin' element={<Admin/>} /> 
        <Route path='/technicien' element={<Technicien/>} /> 
        <Route path='/Statistiques' element={<Statistiques/>} /> 
        <Route path='/TicketsAdmin' element={<TicketsAdmin/>} /> 
        <Route path='/UtilisateurAdmin' element={<UtilisateurAdmin/>} /> 
        <Route path="/modifier/:id" element={<ModifierUtilisateur />} />
        <Route path="/ajouterUtilisateurAdmin" element={<AjouterUtilisateurAdmin />} />


      </Route>
        
  ));

return (
     
  <RouterProvider router= {router}>
  
  </RouterProvider>
  

  );
};

export default App
import React from 'react';
import './index.css';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';

import Login from './pages/login';
import Register from './pages/Register';
import Technicien from './pages/Technicien';
import Admin from './pages/Admin';
import PrivateRoute from './components/PrivateRoute';

import DashboardClient from './pages/ClientPages/DashboardClient';
import DetailsCards from './pages/ClientPages/DetailsCards';
import CreateTicket from './pages/ClientPages/CreateTicket';
import MesTickets from './pages/ClientPages/MesTickets';

import Statistiques from './pages/Statistiques';
import TicketsAdmin from './pages/TicketsAdmin';
import UtilisateurAdmin from './pages/UtilisateurAdmin';
import ModifierUtilisateur from './pages/ModifierUtilisateur';
import AjouterUtilisateurAdmin from './pages/AjouterUtilisateurAdmin';

import TicketDetailsTech from './pages/ticketDetailsTech';

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route element={<PrivateRoute />}>
          <Route path='/admin' element={<Admin />} />
          <Route path='/technicien' element={<Technicien />} />

          <Route path='/client/dashboard' element={<DashboardClient />} />
          <Route path='/client/ticket/:ticketId' element={<DetailsCards />} />
          <Route path='/client/create-ticket' element={<CreateTicket />} />
          <Route path='/client/mes-tickets' element={<MesTickets />} />

          <Route path='/Statistiques' element={<Statistiques />} />
          <Route path='/TicketsAdmin' element={<TicketsAdmin />} />
          <Route path='/UtilisateurAdmin' element={<UtilisateurAdmin />} />
          <Route path='/modifier/:id' element={<ModifierUtilisateur />} />
          <Route path='/ajouterUtilisateurAdmin' element={<AjouterUtilisateurAdmin />} />

          <Route path='/ticketDetailsTech/:id' element={<TicketDetailsTech />} />
        </Route>
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;

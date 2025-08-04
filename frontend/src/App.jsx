import React from 'react'
import './index.css';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';

import Login from './pages/login';
import DashboardClient from './pages/ClientPages/DashboardClient';
import DetailsCards from './pages/ClientPages/DetailsCards';
import Register from './pages/Register';
import Client from './pages/Client';
import Technicien from './pages/Technicien';
import Admin from './pages/Admin';

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path='/' element={<Login/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/client' element={<Client/>} />
        <Route path='/client/dashboard' element={<DashboardClient/>} />
        <Route path='/client/ticket/:ticketId' element={<DetailsCards/>} />
        <Route path='/admin' element={<Admin/>} />
        <Route path='/technicien' element={<Technicien/>} />
      </Route>
    )
  );

  return (
    <RouterProvider router={router} />
  );
};

export default App;
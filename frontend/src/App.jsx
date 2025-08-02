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
const App = () => {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path='/' element={<Login/>} />
        <Route path='/client/dashboard' element={<DashboardClient/>} /> 
      </Route>
        
  ));

return (
     
  <RouterProvider router= {router}>
  
  </RouterProvider>
  

  );
};

export default App
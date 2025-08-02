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


const App = () => {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path='/' element={<Login/>} /> 
        <Route path='/register' element={<Register/>} /> 
        <Route path='/client' element={<Client/>} /> 
        <Route path='/admin' element={<Admin/>} /> 
        <Route path='/technicien' element={<Technicien/>} /> 


      </Route>
        
  ));

return (
     
  <RouterProvider router= {router}>
  
  </RouterProvider>
  

  );
};

export default App
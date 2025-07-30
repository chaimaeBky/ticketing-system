import React from 'react'
import './index.css';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';

import Login from './pages/login';

const App = () => {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path='/' element={<Login/>} /> 
      </Route>
        
  ));

return (
     
  <RouterProvider router= {router}>
  
  </RouterProvider>
  

  );
};

export default App
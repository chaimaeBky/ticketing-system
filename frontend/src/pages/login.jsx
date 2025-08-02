import React , { useState } from "react";
import "../background.css"; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {

    const [email , setEmail] = useState("") ;
    const [password , setPassword] = useState("") ;
    const [message, setMessage] = useState("");



    const navigate = useNavigate();


    const loginSubmit = async (e)  => {
        e.preventDefault();

        console.log({ email, password });
      try {
        const res =  await axios.post('http://localhost:5000/' , {email , password}) ; 
        const role = res.data.user.role ; 

        if (role === 'client')
           navigate('/client') ; 
        else if ( role === 'admin')
           navigate('/admin')
        else if ( role === 'technicien')
           navigate('/technicien')

      } catch (err) {
      if (err.response && err.response.data.error) {
        setMessage('Email ou mot de passe incorrect !');
      } else {
        setMessage('Erreur inconnue');
      }
      }

    }



  return (
    <div className="bg-custom min-h-screen w-full">
      
      <div className="w-full flex justify-center">
        <img
          src="../src/assets/images/logo.jpg"
          alt="Logo"
          className="w-50 h-auto mt-0"
        />
      </div>

      <div className="flex justify-center items-center mt-30">
        <form onSubmit={loginSubmit} className="w-full max-w-md bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4">
            
            <label className="text-gray-700 font-semibold">Email</label>
            <input
              type="email" required
              value={email}
              className="w-full p-2 border rounded bg-white"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="text-gray-700 font-semibold">Mot de passe</label>
            <input
              type="password" required
              value={password}
              className="w-full p-2 border rounded bg-white"
              placeholder="Mot de passe"
              onChange={(e) => setPassword(e.target.value)}
            />
            {message && <p className="text-[#8f1630] text-center font-semibold text-sm mb-2">{message}</p>}
            <button
              type="submit"
              style={{ backgroundColor: "#8f1630" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#a83b52")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#8f1630")}
              className="w-full text-white font-semibold py-2 rounded transition"
            >
              Se connecter
            </button>
            <p className="text-center text-sm text-gray-700 mt-1">
                Vous n’avez pas de compte ?{" "}
                <a href="/register" className="text-[#8f1630] font-semibold hover:underline">
                 Inscrivez-vous
                </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

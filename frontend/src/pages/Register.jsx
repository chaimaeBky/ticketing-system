import React , { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import axios from 'axios'

import "../background.css"; // Make sure .bg-custom is set up

const Register = () => {

    const [nom , setNom] = useState("") ;
    const [email , setEmail] = useState("") ;
    const [password , setPassword] = useState("") ;    
    const [password2 , setPassword2] = useState("") ;
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const registerSubmit = async (e)  => {
        e.preventDefault();


        if (password !== password2) 
        { setMessage(" les mots de passes doivent etre identique ! ") ;
          exit ; 
        }


        const newUser = {
            id: uuidv4(),
            nom ,
            email,
            mot_de_passe: password,
            role: "client" 
        };

    console.log("Envoi des données :", newUser);

    try {
      const res = await axios.post("http://localhost:5000/register", { newUser });
      setMessage(res.data.message);

    if (res.data.message === "Utilisateur enregistré avec succès") {
        navigate('/');
    }

    } catch (err) {
      setMessage(err.response?.data?.error || "Erreur serveur");
    }
  };    

        
        
    



  return (
    <div className="bg-custom min-h-screen w-full">
      
      <div className="w-full flex justify-center">
        <img
          src="../src/assets/images/logo.jpg"
          alt="Logo"
          className="w-50 h-auto mt-0"
        />
      </div>

      <div className="flex justify-center items-center mt-5">
        <form onSubmit={registerSubmit} className="w-full max-w-md bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4">
            
            <label className="text-gray-700 font-semibold">Nom</label>
            <input
              type="Nom" required
              value={nom}
              className="w-full p-2 border rounded bg-white"
              placeholder="Nom"
              onChange={(e) => setNom(e.target.value)}
            />

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

            <label className="text-gray-700 font-semibold">Verifier mot de passe </label>
            <input
              type="password" required
              value={password2}
              className="w-full p-2 border rounded bg-white"
              placeholder="Verifier mot de passe "
              onChange={(e) => setPassword2(e.target.value)}
            />

            
            {message && <p className="text-[#8f1630] text-center font-semibold text-sm mb-2">{message}</p>}
            <button
              type="submit"
              style={{ backgroundColor: "#8f1630" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#a83b52")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#8f1630")}
              className="w-full text-white font-semibold py-2 rounded transition"
            >
              S'inscrire
            </button>
            <p className="text-center text-sm text-gray-700 mt-1">
                Vous avez deja de compte ?{" "}
                <a href="/" className="text-[#8f1630] font-semibold hover:underline">
                 Connectez-vous
                </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import AdminMenu from "../components/AdminMenu";
import "../background.css"; 

const AjouterUtilisateurAdmin = () => {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");    
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState("client"); 
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const registerSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setMessage("Les mots de passe doivent être identiques !");
      return;
    }

    const newUser = {
      id: uuidv4(),
      nom,
      email,
      mot_de_passe: password,
      role
    };

    console.log("Envoi des données :", newUser);

    try {
      const res = await axios.post("http://localhost:5000/register", { newUser });
      setMessage(res.data.message);

      if (res.data.message === "Utilisateur enregistré avec succès") {
        alert("Utilisateur enregistré avec succès")
        navigate('/UtilisateurAdmin');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Erreur serveur");
    }
  };

  return (
    <div className="min-h-screen w-full pt-24">
      <AdminMenu /> 

      

      <div className="flex justify-center items-center mt-5">
        <form onSubmit={registerSubmit} className="w-full max-w-md mb-30 bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-4">
            <label className="text-gray-700 font-semibold">Nom</label>
            <input
              type="text" required
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

            <label className="text-gray-700 font-semibold">Vérifier mot de passe</label>
            <input
              type="password" required
              value={password2}
              className="w-full p-2 border rounded bg-white"
              placeholder="Vérifier mot de passe"
              onChange={(e) => setPassword2(e.target.value)}
            />

            <label className="text-gray-700 font-semibold">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded bg-white"
              required
            >
              <option value="client">Client</option>
              <option value="technicien">Technicien</option>
              <option value="admin">Admin</option>
            </select>

            {message && <p className="text-[#8f1630] text-center font-semibold text-sm mb-2">{message}</p>}
            
            <button
              type="submit"
              style={{ backgroundColor: "#8f1630" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#a83b52")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#8f1630")}
              className="w-full text-white font-semibold py-2 rounded transition"
            >
              Ajouter
            </button>

           
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterUtilisateurAdmin;

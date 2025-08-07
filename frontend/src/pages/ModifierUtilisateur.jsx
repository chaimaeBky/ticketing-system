import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AdminMenu from '../components/AdminMenu';

function ModifierUtilisateur() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    role: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/utilisateur/${id}`)
      .then(res => {
        setFormData({
          nom: res.data.nom || '',
          email: res.data.email || '',
          role: res.data.role || '',
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/modifierUtilisateur/${id}`, formData)
      .then(() => {
        alert("Utilisateur modifié avec succès !");
        navigate("/UtilisateurAdmin");
      })
      .catch(err => console.error(err));
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Chargement des données...</div>;
  }

  return (
     <div className="min-h-screen w-full pt-24">
    <AdminMenu />
    <div className="p-6 max-w-md mt-10 mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center text-[#8f1630]">Modifier l'utilisateur</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          placeholder="Nom"
          className="w-full px-3 py-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">Sélectionner un rôle</option>
          <option value="admin">Admin</option>
          <option value="technicien">Technicien</option>
          <option value="client">Client</option>
        </select>
        <div style={{ display: 'flex', justifyContent: 'right', gap: '10px' }}>
        <button
          type="submit"
          style={{ backgroundColor: "#8f1630" }}
          className="text-white px-4 py-2 rounded font-semibold transition text-md"
        >
          Enregistrer
        </button>
       <button
        type="button"
        onClick={() => navigate('/UtilisateurAdmin')}
        style={{ backgroundColor: "#8f1630" }}
        className="text-white px-4 py-2 rounded font-semibold transition text-md"
        >
        Annuler
        </button>
        </div>
      </form>
      
    </div>
    </div>
  );
}

export default ModifierUtilisateur;

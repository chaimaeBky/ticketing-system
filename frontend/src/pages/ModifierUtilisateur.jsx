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
  const [error, setError] = useState('');

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(`http://localhost:5000/utilisateur/${id}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        setFormData({
          nom: response.data.nom || '',
          email: response.data.email || '',
          role: response.data.role || '',
        });
        
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        if (err.response) {
          setError(err.response.data?.error || 'Erreur lors du chargement des données');
        } else if (err.request) {
          setError('Impossible de contacter le serveur');
        } else {
          setError('Erreur inconnue lors du chargement');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    if (!formData.role.trim()) {
      setError('Le rôle est requis');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format d\'email invalide');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setError('');
      
      const response = await axios.put(
        `http://localhost:5000/modifierUtilisateur/${id}`,
        {
          nom: formData.nom.trim(),
          email: formData.email.trim(),
          role: formData.role.trim()
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      alert("Utilisateur modifié avec succès !");
      navigate("/UtilisateurAdmin");
      
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.error || 
                           `Erreur ${err.response.status}: ${err.response.statusText}`;
        setError(errorMessage);
        alert(errorMessage);
      } else if (err.request) {
        // Request was made but no response received
        const errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        setError(errorMessage);
        alert(errorMessage);
      } else {
        // Something else happened
        const errorMessage = 'Erreur inconnue, veuillez réessayer !';
        setError(errorMessage);
        alert(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-500">Chargement des données...</div>
        </div>
      </div>
    );
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

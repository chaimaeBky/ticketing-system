import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';


const UsersTabAdmin = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    nom: "",
    email: "",
    role: "",
  });

    const navigate = useNavigate()

  useEffect(() => {
    axios
      .get("http://localhost:5000/listeUtilisateurs")
      .then((response) => {
        setUsers(response.data.utilisateurs);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des utilisateurs:", error);
      });
  }, []);

  const handleDelete = (id) => {
  if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

  axios
    .delete(`http://localhost:5000/supprimerUtilisateur/${id}`)
    .then(() => {
      setUsers(users.filter((user) => user.id !== id));
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    });
};

const handleAdd= () => {
  navigate('/ajouterUtilisateurAdmin')
};


  const filteredUsers = users.filter((user) => {
    const { nom, email, role } = filters;

    const matchesNom =
      nom === "" || user.nom?.toLowerCase().includes(nom.toLowerCase());
    const matchesEmail =
      email === "" || user.email?.toLowerCase().includes(email.toLowerCase());
    const matchesRole = role === "" || user.role === role;

    return matchesNom && matchesEmail && matchesRole;
  });

  const badgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-600";
      case "technicien":
        return "bg-blue-100 text-blue-700";
      case "client":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mt-10 mb-6 text-center text-[#8f1630] drop-shadow">
        Liste des Utilisateurs
      </h2>

      <div className="flex justify-between items-center mb-6">
  
  <button
    type="button"
    onClick={handleAdd}
    className="bg-[#8f1630] text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
  >
    Ajouter utilisateur
  </button>
</div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        
        <input
          type="text"
          placeholder="🔍 Filtrer par nom"
          className="border px-3 py-2 rounded"
          value={filters.nom}
          onChange={(e) => setFilters({ ...filters, nom: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filtrer par email"
          className="border px-3 py-2 rounded"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <select
          className="border px-3 py-2 rounded"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="technicien">Technicien</option>
          <option value="client">Client</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full mb-30  bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-[#8f1630]/90 text-white">
            <tr className="">
              <th className="py-3 px-6 text-left">Nom</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Rôle</th>
              <th className="py-3 px-6 text-left flex flex-col items-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-6">{user.nom}</td>
                  <td className="py-3 px-6">{user.email}</td>
                  <td className="py-3 px-6 ">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-6 flex flex-col items-center ">
                    <div className="flex gap-2">
                    <Link to={`/modifier/${user.id}`}>
                  <button className="bg-[#8f1630] text-white px-3 py-1 rounded hover:bg-yellow-600">
                    Modifier
                  </button>
                </Link>

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-[#8f1630] text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                      >
                        Supprimer
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
    </div>
  );
};

export default UsersTabAdmin;
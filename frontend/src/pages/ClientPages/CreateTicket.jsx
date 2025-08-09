import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarClient from '../../components/NavBarClient';
import '../../ClientCSS/Dashboard.css';
import '../../background.css';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sujet: '',
    type: '',
    description: '',
    pieces_jointes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
  const user = localStorage.getItem('user');
  if (!user) {
    navigate('/login');
  }
}, [navigate]);
  // Options pour le sujet (ENUM sujet_ticket)
  const sujetOptions = [
    { value: '', label: 'Sélectionnez un sujet...' },
    { value: 'livraison', label: 'Livraison' },
    { value: 'paiement', label: 'Paiement' },
    { value: 'bug', label: 'Bug' },
    { value: 'retour', label: 'Retour' },
    { value: 'autre', label: 'Autre' }
  ];

  // Options pour le type de ticket
  const typeOptions = [
    { value: '', label: 'Sélectionnez un type...' },
    { value: 'probleme_livraison', label: 'Problème de Livraison' },
    { value: 'incident_transport', label: 'Incident Transport' },
    { value: 'conteneur', label: 'Conteneur' },
    { value: 'stockage', label: 'Stockage' },
    { value: 'facturation_paiement', label: 'Facturation/Paiement' },
    { value: 'reclamation_client', label: 'Réclamation Client' },
    { value: 'probleme_technique', label: 'Problème Technique' }
  ];

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion de l'upload de fichiers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      pieces_jointes: files
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.sujet) {
      setError('Veuillez sélectionner un sujet');
      setLoading(false);
      return;
    }
    if (!formData.type) {
      setError('Veuillez sélectionner un type');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('La description est obligatoire');
      setLoading(false);
      return;
    }

    try {
      // Création d'un FormData pour envoyer les fichiers
      // Récupérer l'utilisateur connecté
const user = JSON.parse(localStorage.getItem('user'));
const clientId = user?.id;

if (!clientId) {
  setError('Utilisateur non connecté. Veuillez vous reconnecter.');
  setLoading(false);
  return;
}

const formDataToSend = new FormData();
formDataToSend.append('sujet', formData.sujet);
formDataToSend.append('type', formData.type);
formDataToSend.append('description', formData.description);
formDataToSend.append('client_id', clientId);
      
      // Ajouter les fichiers - chaque fichier individuellement pour le backend
      if (formData.pieces_jointes.length > 0) {
        formData.pieces_jointes.forEach((file) => {
          formDataToSend.append('pieces_jointes', file);
        });
      }

      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        body: formDataToSend,
        // Ne pas définir Content-Type, le navigateur le fera automatiquement pour FormData
      });

      const data = await response.json();

if (response.ok && data.success) {
  setSuccess('Ticket créé avec succès ! Redirection vers le tableau de bord...');
  setTimeout(() => {
    // Force un vrai rechargement de la page
    window.location.href = '/client/dashboard';
  }, 1500);
} else {
        setError(data.error || 'Erreur lors de la création du ticket');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Handlers pour la navbar
  const handleNewTicket = () => {
    // Déjà sur la page de création
  };

  const handleLogout = () => {
  localStorage.removeItem('user');
  navigate('/login');
};

  return (
    <div className="min-h-screen  dashboard-container bg-custom">
      {/* Background pattern */}
      <div className="dashboard-background">
        <div className="map-pattern"></div>
        <div className="map-shape map-shape-1"></div>
        <div className="map-shape map-shape-2"></div>
        <div className="map-shape map-shape-3"></div>
      </div>

      {/* Navigation */}
      <NavBarClient onNewTicket={handleNewTicket} onLogout={handleLogout} />

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-6">
        <div className="w-full max-w-xl">
          {/* Titre */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Formulaire de réclamation
            </h1>
          </div>

          {/* Formulaire */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Messages d'erreur et succès */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* Sujet */}
              <div className="relative">
                <label htmlFor="sujet" className="block text-base font-semibold text-gray-800 mb-2">
                  Sujet
                </label>
                <select
                  id="sujet"
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors bg-white appearance-none cursor-pointer"
                  required
                >
                  {sujetOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {/* Flèche personnalisée pour le select */}
                <div className="absolute right-3 top-9 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Type */}
              <div className="relative">
                <label htmlFor="type" className="block text-base font-semibold text-gray-800 mb-2">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors bg-white appearance-none cursor-pointer"
                  required
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {/* Flèche personnalisée pour le select */}
                <div className="absolute right-3 top-9 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-base font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors resize-vertical"
                  placeholder="Décrivez votre problème..."
                  required
                />
              </div>

              {/* Pièces jointes */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  Pièces jointes
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="pieces_jointes"
                    name="pieces_jointes"
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
                    className="hidden"
                  />
                  <label
                    htmlFor="pieces_jointes"
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer font-medium border border-gray-300"
                  >
                    Choisir un fichier
                  </label>
                  {formData.pieces_jointes.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {formData.pieces_jointes.length} fichier(s)
                    </span>
                  )}
                </div>
                
                {/* Liste des fichiers sélectionnés */}
                {formData.pieces_jointes.length > 0 && (
                  <div className="mt-2">
                    <ul className="space-y-1 max-h-20 overflow-y-auto">
                      {formData.pieces_jointes.map((file, index) => (
                        <li key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          • {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bouton Soumettre */}
              <div className="text-right pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : 'Soumettre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTicket;
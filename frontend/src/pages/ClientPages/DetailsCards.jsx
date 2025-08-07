import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBarClient from '../../components/NavBarClient';

const DetailsCards = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ticket details from backend
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setTicket(data.ticket);
        } else {
          setError(data.error || 'Erreur lors du chargement du ticket');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du ticket:', error);
        setError('Erreur lors du chargement du ticket');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options).replace(' à ', ' à ');
  };

  // Handle file upload
  // Handler pour l'upload de fichiers
const handleFileUpload = async (event) => {
  const files = event.target.files;
  if (files.length === 0) return;

  try {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    const response = await fetch(`/api/tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: formData,
      // Note: Ne pas mettre 'Content-Type' header, le navigateur le fera automatiquement
    });

    const data = await response.json();
    
    if (response.ok) {
      // Rafraîchir les données du ticket
      const ticketResponse = await fetch(`/api/tickets/${ticketId}`);
      const ticketData = await ticketResponse.json();
      setTicket(ticketData.ticket);
      alert('Fichier(s) uploadé(s) avec succès');
    } else {
      throw new Error(data.error || 'Erreur lors de l\'upload');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert(error.message);
  }
};

// Handler pour le téléchargement avec meilleure gestion d'erreurs
const handleDownloadAttachments = async () => {
  try {
    // 1. Vérification de la connexion
    const healthCheck = await fetch('http://localhost:5000/api/health');
    if (!healthCheck.ok) throw new Error("Serveur indisponible");

    // 2. Récupération des pièces jointes
    const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}/attachments`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Échec de la requête");
    }

    const { attachments } = await res.json();
    if (!attachments?.length) {
      alert("Aucune pièce jointe disponible");
      return;
    }

    // 3. Téléchargement séquentiel
    for (const att of attachments) {
      try {
        const fileRes = await fetch(
          `http://localhost:5000/api/tickets/${ticketId}/attachments/${att.id}`
        );
        
        if (!fileRes.ok) {
          console.error(`Échec pour ${att.id}: ${fileRes.statusText}`);
          continue;
        }

        // Gestion du nom de fichier
        const filename = att.nom || `piece_jointe_${att.id}`;
        const blob = await fileRes.blob();
        
        // Création du lien de téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
      } catch (fileError) {
        console.error(`Erreur sur ${att.id}:`, fileError);
      }
    }

  } catch (err) {
    console.error("Erreur globale:", err);
    alert(`Erreur : ${err.message}`);
  }
};

// Fonction utilitaire pour tester la connexion au serveur
const testServerConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/tickets');
    if (response.ok) {
      console.log('✓ Serveur Flask accessible');
      return true;
    } else {
      console.error('✗ Serveur Flask retourne une erreur:', response.status);
      return false;
    }
  } catch (error) {
    console.error('✗ Impossible de contacter le serveur Flask:', error);
    return false;
  }
};

  // Handlers
  const handleNewTicket = () => {
    console.log('Créer nouveau ticket');
  };

  const handleLogout = () => {
    console.log('Déconnexion');
  };

  const handleBackToDashboard = () => {
  navigate(-1); // Retour à la page précédente
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBarClient onNewTicket={handleNewTicket} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBarClient onNewTicket={handleNewTicket} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Ticket non trouvé'}</p>
            <button 
              onClick={handleBackToDashboard}
className="text-lg font-bold" style={{ color: '#8f1630' }}            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dashboard-container bg-custom">
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
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="w-full max-w-4xl">
          {/* Back button */}
          <div className="mb-6">
            <button 
              onClick={handleBackToDashboard}
className="text-lg font-bold" style={{ color: '#8f1630' }}            >
              ← Retour 
            </button>
          </div>

          {/* Ticket Details Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
            <div className="space-y-4">
              {/* Sujet */}
              <div>
                <span className="font-bold text-gray-800">Sujet :</span>
                <span className="text-gray-700 ml-2">{ticket.sujet}</span>
              </div>

              {/* Description */}
              <div>
                <span className="font-bold text-gray-800">Description :</span>
                <span className="text-gray-700 ml-2">{ticket.description}</span>
              </div>

              {/* Type */}
              <div>
                <span className="font-bold text-gray-800">Type :</span>
                <span className="text-gray-700 ml-2 capitalize">{ticket.type}</span>
              </div>

              {/* État */}
              <div>
                <span className="font-bold text-gray-800">État :</span>
                <span className="text-gray-700 ml-2 capitalize">{ticket.etat}</span>
              </div>

              {/* Date création */}
              <div>
                <span className="font-bold text-gray-800">Date création :</span>
                <span className="text-gray-700 ml-2">{formatDate(ticket.date_creation)}</span>
              </div>

              {/* Date résolution */}
              <div>
                <span className="font-bold text-gray-800">Date résolution :</span>
                <span className="text-gray-700 ml-2">{formatDate(ticket.date_resolution)}</span>
              </div>

              {/* Affecté à */}
              <div>
                <span className="font-bold text-gray-800">Affecté à :</span>
                <span className="text-gray-700 ml-2">
                  {ticket.technicien_nom ? `Technicien ${ticket.technicien_nom}` : 'Non assigné'}
                </span>
              </div>

              {/* ID */}
              <div>
                <span className="font-bold text-gray-800">ID :</span>
                <span className="text-gray-700 ml-2">{ticket.id}</span>
              </div>

              {/* Pièces jointes section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Upload button */}
                  <div>
                    <input
                      type="file"
                      id="fileUpload"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="fileUpload"
className="w-full bg-red-800 text-white px-8 py-3 rounded-lg hover:bg-red-900 transition-colors font-medium text-lg shadow-lg text-center block cursor-pointer"                    >
                      Ajouter pièces jointes
                    </label>
                  </div>

                  {/* Download button */}
                  <button
                    onClick={handleDownloadAttachments}
                    className="bg-red-800 text-white px-8 py-3 rounded-lg hover:bg-red-900 transition-colors font-medium text-lg shadow-lg"
                  >
                    Télécharger pièces jointes
                    {ticket.pieces_jointes && ticket.pieces_jointes.length > 0 && (
                      <span className="ml-2 bg-green-800 text-xs px-2 py-1 rounded-full">
                        {ticket.pieces_jointes.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Liste des pièces jointes existantes */}
                {ticket.pieces_jointes && ticket.pieces_jointes.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700 mb-2">Pièces jointes actuelles :</p>
                    <ul className="space-y-1">
                      {ticket.pieces_jointes.map((piece) => (
                        <li key={piece.id} className="text-sm text-gray-600">
                          • {piece.nom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailsCards;
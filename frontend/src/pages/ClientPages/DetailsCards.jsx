import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBarClient from '../../components/NavBarClient';

const DetailsCards = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Base URL pour l'API
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch ticket details from backend
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`);

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
      fetchAttachments(); // Charger aussi les pièces jointes
    }
  }, [ticketId]);

  // Fetch attachments
  const fetchAttachments = async () => {
    try {
      console.log(`🔍 Récupération des pièces jointes pour le ticket ${ticketId}`);
      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/attachments`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📎 Pièces jointes reçues:', data);
        setAttachments(data.attachments || []);
      } else {
        console.error('Erreur lors du chargement des pièces jointes:', response.status);
        setAttachments([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des pièces jointes:', error);
      setAttachments([]);
    }
  };

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

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 🔥 FIXED: Handle file upload with proper error handling
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    setUploadLoading(true);
    console.log(`📤 Upload de ${files.length} fichier(s) pour le ticket ${ticketId}`);

    try {
      // Upload each file individually (as your Flask route expects one file)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📁 Upload du fichier: ${file.name} (${formatFileSize(file.size)})`);
        
        const formData = new FormData();
        formData.append('file', file);

        // 🔥 FIX: Use full URL with proper endpoint
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/attachments`, {
          method: 'POST',
          body: formData,
          // Ne pas définir Content-Type, le navigateur le fera automatiquement
        });

        // 🔥 FIX: Better error handling for empty responses
        let data = {};
        const responseText = await response.text();
        
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Erreur parsing JSON:', parseError);
            console.log('Response text:', responseText);
            throw new Error('Réponse serveur invalide');
          }
        }
        
        if (!response.ok) {
          throw new Error(data.error || `Erreur HTTP ${response.status}`);
        }

        console.log(`✅ Fichier ${file.name} uploadé avec succès`);
      }

      // Refresh attachments list
      await fetchAttachments();
      
      // Reset file input
      event.target.value = '';
      
      alert(`fichier(s) uploadé(s) avec succès!`);
      
    } catch (error) {
      console.error('❌ Erreur upload:', error);
      alert(`Erreur lors de l'upload: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // 🔥 IMPROVED: Download individual attachment
  const handleDownloadAttachment = async (attachmentId, fileName) => {
    try {
      console.log(`📥 Téléchargement de ${fileName} (ID: ${attachmentId})`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/tickets/${ticketId}/attachments/${attachmentId}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log(`✅ ${fileName} téléchargé avec succès`);
      
    } catch (error) {
      console.error(`❌ Erreur téléchargement ${fileName}:`, error);
      alert(`Erreur lors du téléchargement: ${error.message}`);
    }
  };

  // 🔥 IMPROVED: Download all attachments
  const handleDownloadAllAttachments = async () => {
    if (attachments.length === 0) {
      alert("Aucune pièce jointe disponible");
      return;
    }

    try {
      console.log(`📦 Téléchargement de ${attachments.length} pièce(s) jointe(s)`);
      
      // Download each attachment sequentially
      for (const attachment of attachments) {
        await handleDownloadAttachment(attachment.id, attachment.nom);
        // Small delay between downloads to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('✅ Tous les téléchargements terminés');
      
    } catch (error) {
      console.error("❌ Erreur téléchargement global:", error);
      alert(`Erreur: ${error.message}`);
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
      <div className="min-h-screen bg-custom">
        <NavBarClient onNewTicket={handleNewTicket} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-custom">
        <NavBarClient onNewTicket={handleNewTicket} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Ticket non trouvé'}</p>
            <button 
              onClick={handleBackToDashboard}
              className="text-lg font-bold" 
              style={{ color: '#8f1630' }}
            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-container bg-custom">
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
              className="text-lg font-bold" 
              style={{ color: '#8f1630' }}
            >
              ← Retour 
            </button>
          </div>

          {/* Ticket Details Card */}
          <div className="bg-white border border-gray-200 mb-30 rounded-lg p-8 shadow-lg">
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

              {/* 🔥 IMPROVED: Pièces jointes section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">Pièces jointes</h3>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {/* Upload button */}
                  <div className="relative">
                    <input
                      type="file"
                      id="fileUpload"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                      onChange={handleFileUpload}
                      disabled={uploadLoading}
                      className="hidden"
                    />
                    <label
                      htmlFor="fileUpload"
                      className={`w-full px-8 py-3 rounded-lg transition-colors font-medium text-lg shadow-lg text-center block cursor-pointer ${
                        uploadLoading 
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                          : 'bg-[#8f1630] text-white hover:bg-red-900'
                      }`}
                    >
                      {uploadLoading ? 'Upload en cours...' : 'Ajouter pièces jointes'}
                    </label>
                  </div>

                  {/* Download all button */}
                  <button
                    onClick={handleDownloadAllAttachments}
                    disabled={attachments.length === 0}
                    className={`px-8 py-3 rounded-lg transition-colors font-medium text-lg shadow-lg ${
                      attachments.length === 0
                        ? 'bg-[#8f1630] text-white cursor-not-allowed'
                        : 'bg-[#8f1630] text-white hover:bg-green-900'
                    }`}
                  >
                    Télécharger tout ({attachments.length})
                  </button>
                </div>

                {/* 🔥 NEW: Liste des pièces jointes existantes */}
                {attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700 mb-3">
                      Pièces jointes disponibles ({attachments.length}) :
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {attachments.map((attachment) => (
                        <div 
                          key={attachment.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{attachment.nom}</p>
                            <p className="text-sm text-gray-600">
                              {formatFileSize(attachment.taille)}
                              {!attachment.exists && (
                                <span className="text-red-500 ml-2">(Fichier manquant)</span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownloadAttachment(attachment.id, attachment.nom)}
                            disabled={!attachment.exists}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              attachment.exists
                                ? 'bg-[#8f1630] text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Télécharger
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message when no attachments */}
                {attachments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune pièce jointe pour ce ticket</p>
                    <p className="text-sm mt-1">Utilisez le bouton ci-dessus pour en ajouter</p>
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
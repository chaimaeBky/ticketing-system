import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TechMenu from '../components/TechMenu';

const TicketDetailsTech = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ticket/${id}`);
        const data = await res.json();
        if (data.error) setError(data.error);
        else setTicket(data);
      } catch (err) {
        setError('Erreur lors du chargement du ticket');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttachments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tickets/${id}/attachments`);
        const data = await res.json();
        setAttachments(data.attachments || []);
      } catch (err) {
        console.error(err);
        setAttachments([]);
      }
    };

    fetchTicket();
    fetchAttachments();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options).replace(' à ', ' à ');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadAttachment = async (attachmentId, fileName) => {
    try {
      console.log(`📥 Téléchargement de ${fileName} (ID: ${attachmentId})`);
      
      const response = await fetch(`${API_BASE_URL}/api/tickets/${id}/attachments/${attachmentId}`);
      
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

  // Download all attachments
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

  // Fonction pour changer l'état et définir date_resolution si RESOLU
  const handleChangeEtat = async (newEtat) => {
    try {
      const bodyData = { etat: newEtat };
      if (newEtat === 'RESOLU') bodyData.date_resolution = new Date().toISOString();
      else bodyData.date_resolution = null;

      const res = await fetch(`${API_BASE_URL}/tickets/${id}/etat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour');

      setTicket({ 
        ...ticket, 
        etat: newEtat,
        date_resolution: bodyData.date_resolution
      });
    } catch (err) {
      console.error(err);
      alert("Impossible de changer l'état du ticket");
    }
  };

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="min-h-screen bg-custom">
        <TechMenu />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-custom">
        <TechMenu />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Ticket non trouvé'}</p>
            <button 
              onClick={handleBack}
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
      <TechMenu />

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center mt-20 min-h-[calc(100vh-80px)] px-6">
        <div className="w-full max-w-6xl flex gap-6">
          
          {/* Ticket Details Card - Largeur flexible */}
          <div className="flex-1">
            {/* Back button */}
            <div className="mb-6">
              <button 
                onClick={handleBack}
                className="text-lg font-bold" 
                style={{ color: '#8f1630' }}
              >
                ← Retour 
              </button>
            </div>

            <div className="bg-white border border-gray-200 mb-30 rounded-lg p-8 shadow-lg">
              <div className="space-y-4">
                {/* ID */}
                <div>
                  <span className="font-bold text-gray-800">ID :</span>
                  <span className="text-gray-700 ml-2">{ticket.id}</span>
                </div>

                {/* Client */}
                <div>
                  <span className="font-bold text-gray-800">Client :</span>
                  <span className="text-gray-700 ml-2">{ticket.client}</span>
                </div>

                {/* Technicien */}
                <div>
                  <span className="font-bold text-gray-800">Technicien :</span>
                  <span className="text-gray-700 ml-2">{ticket.technicien || '—'}</span>
                </div>

                {/* Sujet */}
                <div>
                  <span className="font-bold text-gray-800">Sujet :</span>
                  <span className="text-gray-700 ml-2">{ticket.sujet}</span>
                </div>

                {/* Description */}
                <div>
                  <span className="font-bold text-gray-800">Description :</span>
                  <span className="text-gray-700 ml-2">{ticket.description || 'Aucune description'}</span>
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

                {/* Pièces jointes section */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">Pièces jointes</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {/* Download all button */}
                    <button
                      onClick={handleDownloadAllAttachments}
                      disabled={attachments.length === 0}
                      className={`px-8 py-3 rounded-lg transition-colors font-medium text-lg shadow-lg ${
                        attachments.length === 0
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'bg-[#8f1630] text-white hover:bg-green-900'
                      }`}
                    >
                      Télécharger tout ({attachments.length})
                    </button>
                  </div>

                  {/* Liste des pièces jointes existantes */}
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Panneau indépendant pour changer l'état - Position fixe à droite */}
          <div className="w-64 bg-white mt-50 rounded-xl shadow-lg p-5 flex flex-col gap-4 h-fit">
            <h3 className="font-bold text-lg text-[#8f1630]">Changer l'état</h3>
            <select
              defaultValue=""
              onChange={(e) => handleChangeEtat(e.target.value)}
              className="border border-[#8f1630] rounded-lg px-3 py-2 bg-[#8f1630] text-white shadow-sm hover:bg-[#a1213c] focus:outline-none transition duration-200"
            >
              <option value="" disabled>-- Changer l'état --</option>
              <option value="EN_COURS">EN_COURS</option>
              <option value="RESOLU">RESOLU</option>
            </select>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketDetailsTech;
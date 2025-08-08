import React from 'react';

const TicketCard = ({ ticket, onViewDetails }) => {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(ticket.id);
    }
  };

  return (
<div className="ticket-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        {/* Numéro de ticket */}
       <div>
          <span className="text-lg font-bold" style={{ color: '#8f1630' }}>
            Ticket {ticket.id}
          </span>
        </div>
        
        {/* Sujet du ticket */}
        <div  className="ml-4">
          <span className="font-bold text-gray-700">Sujet :</span>
          <span className="font-bold text-gray-500 ml-1">{ticket.sujet}</span>
        </div>
        
          {/* Bouton Voir détails */}
        <div className="text-right">
          <button 
            onClick={handleViewDetails}
            className="font-bold hover:underline transition-colors"
            style={{ color: '#8f1630' }}
          >
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
import React from 'react';
import StatusBadge from './StatusBadge';

const TicketCard = ({ ticket }) => {
  return (
    <div className="ticket-card">
      <h3>Ticket {ticket.id}</h3>
      <p>Sujet : {ticket.subject}</p>
      <StatusBadge status={ticket.status} />
      <button className="details-btn">Voir details</button>
    </div>
  );
};

export default TicketCard;
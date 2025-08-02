import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'open':
        return {
          label: 'Ouvert',
          classes: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'in_progress':
        return {
          label: 'En cours',
          classes: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'resolved':
        return {
          label: 'Résolu',
          classes: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'closed':
        return {
          label: 'Fermé',
          classes: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'pending':
        return {
          label: 'En attente',
          classes: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      default:
        return {
          label: 'Inconnu',
          classes: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'open' ? 'bg-blue-400' :
        status === 'in_progress' ? 'bg-yellow-400' :
        status === 'resolved' ? 'bg-green-400' :
        status === 'closed' ? 'bg-gray-400' :
        status === 'pending' ? 'bg-orange-400' : 'bg-gray-400'
      }`}></span>
      {statusConfig.label}
    </span>
  );
};

export default StatusBadge;
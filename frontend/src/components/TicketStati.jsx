import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const TicketStati = () => {
  const [ticketStati, setTicketStati] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/admin")
      .then((res) => res.json())
      .then((data) => {
        setTicketStati(data.ticketStati || []);
      })
      .catch((err) => {
        console.error("Erreur fetch stats:", err);
      });
  }, []);

  const COLORS = {
    "OUVERT": "#efbdd0",     
    "EN_COURS": "#b7939c",   
    "FERME": "#754752",      
    "RESOLU": "#b3304c",    
  };

  return (
    <div className="flex flex-col items-center mt-10 bg-white/80 backdrop-blur-md border border-gray-300 rounded-xl shadow-md p-6 w-fit">
      <h2 className="text-xl font-semibold mb-4 text-black">Répartition des tickets</h2>

      <PieChart width={250} height={250}>
        <Pie
          data={ticketStati}
          dataKey="percentage"
          nameKey="etat"
          cx="50%"
          cy="50%"
          outerRadius={70}
          innerRadius={50}
          label={({ percentage }) => `(${percentage}%)`}
        >
          {ticketStati.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.etat] || "#ccc"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default TicketStati;

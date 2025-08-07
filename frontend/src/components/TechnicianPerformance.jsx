import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function TechnicianPerformance() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/technicians/performance")
      .then((res) => res.json())
      .then((data) => setData(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erreur de chargement :", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#8f1630]">Performance des Techniciens</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nom" />
          <YAxis label={{ value: "Tickets / Heures", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="resolved_tickets" fill="#8f1630" name="Tickets Résolus" />
          <Bar dataKey="avg_resolution_hours" fill="#8884d8" name="Temps Moyen (h)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TechnicianPerformance;

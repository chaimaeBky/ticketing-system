import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const TicketsParMois = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/ticketsParMois")
      .then((res) => {
        setData(res.data.ticketsParMois);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des tickets par mois :", err);
      });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 bg-white border border-gray-200 rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-center mb-4 text-[#8f1630]">Tickets créés par mois</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="nombre" fill="#8f1630" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketsParMois;

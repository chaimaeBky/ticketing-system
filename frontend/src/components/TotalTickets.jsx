import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTicketAlt } from "react-icons/fa";

const TotalTickets = () => {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/admin")
      .then((res) => {
        setTotal(res.data.totalTickets);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des tickets :", err);
      });
  }, []); 

  return (
    <div className="max-w-md mx-auto mt-10 bg-[#e4e4e4] backdrop-blur-md border border-gray-300 rounded-xl shadow-md p-6 text-center text-xl font-semibold text-black flex flex-col items-center justify-center ">
      <FaTicketAlt className="text-[#8f1630] text-3xl justify-center" />
      Nombre total des tickets :{" "}
      <span className="text-[#8f1630]">
        {total !== null ? total : "Chargement..."}
      </span>
    </div>
  );
};

export default TotalTickets;

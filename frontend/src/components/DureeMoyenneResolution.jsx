import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClock } from "react-icons/fa";

const DureeMoyenne = () => {
  const [duree, setDuree] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/admin")
      .then((res) => {
        setDuree(res.data.dureeMoyenne);
      })
      .catch((err) => {
        console.error("Erreur lors de calcul de la durée moyenne de resolution :", err);
      });
  }, []); 

    const formatDuree = (totalSeconds) => {
        const jours = Math.floor(totalSeconds / 86400); 
        const heures = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${jours}j ${heures}h ${minutes}m`;
    };


  return (
    <div className="max-w-md mx-auto mt-10 bg-[#e4e4e4] backdrop-blur-md border border-gray-300 rounded-xl shadow-md p-6 text-center text-xl font-semibold text-black flex flex-col items-center justify-center ">
      <FaClock className="text-[#8f1630] text-3xl items-center" />
      Durée moyenne de resolutions :{" "}
      <span className="text-[#8f1630]">
        {duree !== null ? formatDuree(duree) : "Chargement..."}
      </span>
    </div>
  );
};

export default DureeMoyenne;

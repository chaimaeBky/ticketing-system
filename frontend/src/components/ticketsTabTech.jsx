import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";

const TicketsTabTech = () => {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    client: "",
    sujet: "",
    etat: "",
    dateCreation: "",
  });
  const [loading, setLoading] = useState(true);
  const technicienId = localStorage.getItem("technicien_id");
  const navigate = useNavigate();

  useEffect(() => {
    if (!technicienId) {
      navigate("/"); // rediriger si pas connecté
      return;
    }

    fetch(`http://localhost:5000/ticketsTechnicien?technicien_id=${technicienId}`)
      .then((res) => res.json())
      .then((data) => {
        setTickets(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur tickets:", err);
        setLoading(false);
      });
  }, [technicienId, navigate]);

  const badgeColor = (etat) => {
    switch (etat) {
      case "OUVERT": return "bg-red-100 text-red-600";
      case "EN_COURS": return "bg-yellow-100 text-yellow-700";
      case "RESOLU": return "bg-blue-100 text-blue-700";
      case "FERME": return "bg-green-100 text-green-700";
      default: return "bg-gray-200 text-gray-700";
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const { client, sujet, etat, dateCreation } = filters;
    return (
      (client === "" || ticket.client.toLowerCase().includes(client.toLowerCase())) &&
      (sujet === "" || ticket.sujet.toLowerCase().includes(sujet.toLowerCase())) &&
      (etat === "" || ticket.etat === etat) &&
      (dateCreation === "" || ticket.date_creation?.startsWith(dateCreation))
    );
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      startY: 30,
      head: [["Client", "Sujet", "Type", "État", "Date"]],
      body: filteredTickets.map((t) => [
        t.client,
        t.sujet,
        t.type,
        t.etat,
        t.date_creation?.split(" ")[0] || "",
      ]),
    });
    doc.text("Mes Tickets", 14, 20);
    doc.save("tickets_technicien.pdf");
  };

  const csvData = filteredTickets.map((t) => ({
    Client: t.client,
    Sujet: t.sujet,
    Type: t.type,
    État: t.etat,
    Date: t.date_creation?.split(" ")[0] || "",
  }));

  if (loading) return <p className="text-center mt-10">Chargement des tickets...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#8f1630] drop-shadow">
        Mes Tickets
      </h2>

      {/* Filtrage */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="🔍 Filtrer par client"
          className="border px-3 py-2 rounded"
          value={filters.client}
          onChange={(e) => setFilters({ ...filters, client: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filtrer par sujet"
          className="border px-3 py-2 rounded"
          value={filters.sujet}
          onChange={(e) => setFilters({ ...filters, sujet: e.target.value })}
        />
        <select
          className="border px-3 py-2 rounded"
          value={filters.etat}
          onChange={(e) => setFilters({ ...filters, etat: e.target.value })}
        >
          <option value="">Tous les états</option>
          <option value="OUVERT">OUVERT</option>
          <option value="EN_COURS">EN_COURS</option>
          <option value="RESOLU">RESOLU</option>
          <option value="FERME">FERME</option>
        </select>
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={filters.dateCreation}
          onChange={(e) => setFilters({ ...filters, dateCreation: e.target.value })}
        />
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-[#8f1630]/90 text-white">
  <tr>
    <th className="py-3 px-6">Client</th>
    <th className="py-3 px-6">Sujet</th>
    <th className="py-3 px-6">Type</th>
    <th className="py-3 px-6">État</th>
    <th className="py-3 px-6">Création</th>
    <th className="py-3 px-6">Détails</th>
  </tr>
</thead>
<tbody>
  {filteredTickets.length > 0 ? (
    filteredTickets.map((ticket) => (
      <tr key={ticket.id} className="border-b hover:bg-gray-50">
        <td className="py-3 px-6">{ticket.client}</td>
        <td className="py-3 px-6">{ticket.sujet}</td>
        <td className="py-3 px-6">{ticket.type}</td>
        <td className="py-3 px-6">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor(ticket.etat)}`}
          >
            {ticket.etat}
          </span>
        </td>
        <td className="py-3 px-6">{ticket.date_creation?.split(" ")[0]}</td>
        <td className="py-3 px-6">
          <button
            onClick={() => navigate(`/ticketDetailsTech/${ticket.id}`)}
            className="bg-[#8f1630]-0 text-[#8f1630]  px-3 py-1 rounded hover:bg-[#a1213c]"
          >
            Voir details
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="text-center py-6 text-gray-500">
        Aucun ticket trouvé.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      {/* Export CSV / PDF */}
      <div className="mt-5 flex gap-10 justify-center">
        <button
          onClick={exportPDF}
          className="bg-[#8f1630] text-white px-4 py-2 rounded hover:bg-[#a1213c]"
        >
          Exporter PDF
        </button>
        <CSVLink
          data={csvData}
          filename={"tickets_technicien.csv"}
          className="bg-[#8f1630] text-white px-4 py-2 rounded hover:bg-[#a1213c]"
        >
          Exporter CSV
        </CSVLink>
      </div>
    </div>
  );
};

export default TicketsTabTech;

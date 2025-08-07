import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";

const TicketsTabAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [filters, setFilters] = useState({
    client: "",
    sujet: "",
    etat: "",
    technicien: "",
    dateCreation: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/ticketsAdmin")
      .then((res) => res.json())
      .then((data) => setTickets(data || []))
      .catch((err) => console.error("Erreur tickets:", err));

    fetch("http://localhost:5000/listeTechniciens")
      .then((res) => res.json())
      .then((res) => setTechniciens(res.techniciens || []))
      .catch((err) => console.error("Erreur techniciens:", err));
  }, []);

  const handleAssign = (ticketId, technicienId) => {
    fetch(`http://localhost:5000/assign-technicien`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId, technicien_id: technicienId }),
    })
      .then((res) => {
        if (res.ok) alert("Technicien assigné avec succès !");
        else alert("Erreur lors de l'assignation.");
      })
      .catch((err) => console.error("Erreur assignation:", err));
  };

  const badgeColor = (etat) => {
    switch (etat) {
      case "OUVERT":
        return "bg-red-100 text-red-600";
      case "EN_COURS":
        return "bg-yellow-100 text-yellow-700";
      case "RESOLU":
        return "bg-blue-100 text-blue-700";
      case "FERME":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const { client, sujet, etat, technicien, dateCreation } = filters;

    const matchesClient =
      client === "" || ticket.client.toLowerCase().includes(client.toLowerCase());
    const matchesSujet =
      sujet === "" || ticket.sujet.toLowerCase().includes(sujet.toLowerCase());
    const matchesEtat = etat === "" || ticket.etat === etat;
    const matchesTechnicien =
      technicien === "" || (ticket.technicien || "").toLowerCase().includes(technicien.toLowerCase());
    const matchesDateCreation =
      dateCreation === "" ||
      ticket.date_creation?.startsWith(dateCreation); 

    return (
      matchesClient &&
      matchesSujet &&
      matchesEtat &&
      matchesTechnicien &&
      matchesDateCreation
    );
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      startY: 30,
      head: [["Client", "Sujet", "Type", "État", "Technicien", "Date"]],
      body: filteredTickets.map((ticket) => [
        ticket.client,
        ticket.sujet,
        ticket.type,
        ticket.etat,
        ticket.technicien || "—",
        ticket.date_creation?.split("T")[0] || "",
      ]),
    });
    doc.text("Liste des Tickets", 14, 20);
    doc.save("tickets.pdf");
  };

  const csvData = filteredTickets.map(ticket => ({
  Client: ticket.client,
  Sujet: ticket.sujet,
  Type: ticket.type,
  État: ticket.etat,
  Technicien: ticket.technicien || "—",
  Date: `'${ticket.date_creation?.split("T")[0] || ""}`, 
}));


  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#8f1630] drop-shadow"> Liste des Tickets</h2>

      <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder=" 🔍 Filtrer par client"
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
          type="text"
          placeholder="Filtrer par technicien"
          className="border px-3 py-2 rounded"
          value={filters.technicien}
          onChange={(e) => setFilters({ ...filters, technicien: e.target.value })}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={filters.dateCreation}
          onChange={(e) => setFilters({ ...filters, dateCreation: e.target.value })}
        />
      </div>

      

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-[#8f1630]/90 text-white">
            <tr>
              <th className="py-3 px-6 text-left"> Client</th>
              <th className="py-3 px-6 text-left"> Sujet</th>
              <th className="py-3 px-6 text-left"> Type</th>
              <th className="py-3 px-6 text-left"> État</th>
              <th className="py-3 px-6 text-left"> Technicien</th>
              <th className="py-3 px-6 text-left"> Création</th>
              <th className="py-3 px-6 text-left"> Assigner</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-6">{ticket.client}</td>
                  <td className="py-3 px-6 capitalize">{ticket.sujet}</td>
                  <td className="py-3 px-6">{ticket.type}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor(
                        ticket.etat
                      )}`}
                    >
                      {ticket.etat}
                    </span>
                  </td>
                  <td className="py-3 px-6">{ticket.technicien || <span className="text-gray-400 ">—</span>}</td>
                  <td className="py-3 px-6">{ticket.date_creation?.split("T")[0]}</td>
                  <td className="py-3 px-6">
                    <select
                      className="px-2 py-1 border border-gray-300 rounded-md shadow-sm bg-gray-50 hover:border-gray-500"
                      defaultValue=""
                      onChange={(e) => handleAssign(ticket.id, e.target.value)}
                    >
                      <option value="" disabled>
                        Sélectionner
                      </option>
                      {techniciens.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.nom}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  Aucun ticket trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex gap-10 justify-center">
        <button
          onClick={exportPDF}
          className="bg-[#8f1630] text-white px-4 py-2 rounded hover:bg-[#a1213c]"
        >
          Exporter PDF
        </button>

        <CSVLink
          data={csvData}
          filename={"tickets.csv"}
          className="bg-[#8f1630] text-white px-4 py-2 rounded hover:bg-[#a1213c]"
        >
          Exporter CSV
        </CSVLink>
      </div>
    </div>
  );
};

export default TicketsTabAdmin;

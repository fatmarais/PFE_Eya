import React, { useState, useEffect } from "react";
import "./AgentsList.css";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import axios from "axios";

const AgentsList = () => {
  const [agents, setAgents] = useState([]);
  const [newAgent, setNewAgent] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    cin: "",
    role:"agent",
  });
  const [editingId, setEditingId] = useState(null);
  const [editAgent, setEditAgent] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    cin: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch agents from the backend
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/agents"
        );
        setAgents(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des agents :", error);
      }
    };

    fetchAgents();
  }, []);

  const handleAdd = () => {
  // Validate required fields
  if (
    !newAgent.nom ||
    !newAgent.prenom ||
    !newAgent.email ||
    !newAgent.telephone ||
    !newAgent.cin ||
    !newAgent.password
  ) {
    alert("Veuillez remplir tous les champs requis.");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newAgent.email)) {
    alert("Veuillez entrer une adresse email valide.");
    return;
  }

  // Validate telephone number (optional: regex for your region)
  if (newAgent.telephone.length < 8) {
    alert("Veuillez entrer un numéro de téléphone valide.");
    return;
  }

  // Add agent to the backend
  const addAgent = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/",
        newAgent
      );

      // Update agents list and reset form
      setAgents([...agents, response.data]);
      setNewAgent({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        cin: "",
        role: "agent",
        password: "",
      });
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'agent :", error);
      alert("Une erreur s'est produite lors de l'ajout de l'agent.");
    }
  };

  addAgent();
};


  const startEdit = (agent) => {
    setEditingId(agent.id);
    setEditAgent({
      nom: agent.nom,
      prenom: agent.prenom,
      email: agent.email,
      telephone: agent.telephone,
      cin: agent.cin,
    });
  };

  const handleSave = (id) => {
    const updateAgent = async () => {
      try {
        await axios.put(`http://localhost:5000/api/users/${id}`, editAgent);
        setAgents(agents.map((a) => (a.id === id ? { id, ...editAgent } : a)));
        setEditingId(null);
      } catch (error) {
        console.error("Erreur lors de la modification de l'agent :", error);
      }
    };

    updateAgent();
  };

  const handleDelete = (agentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet agent ?")) {
      const deleteAgent = async () => {
        try {
          await axios.delete(`http://localhost:5000/api/users/${agentId}`);
          setAgents(agents.filter((agent) => agent.id !== agentId));
        } catch (error) {
          console.error("Erreur lors de la suppression de l'agent :", error);
        }
      };

      deleteAgent();
    }
  };

  return (
    <div className="admin-container">
      <Topbar />
      <div className="admin-content-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="agents-list-container">
            <h2>Liste des Agents</h2>
            <button className="add-btn" onClick={() => setIsModalOpen(true)}>
              Ajouter un Agent
            </button>

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white w-2/3 max-w-4xl rounded-lg p-8 shadow-lg">
                  <h3 className="text-xl font-bold mb-6 text-gray-800">
                    Ajouter un Agent
                  </h3>
                  <form className="grid grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-gray-600 font-medium mb-2"
                        htmlFor="nom"
                      >
                        Nom
                      </label>
                      <input
                        type="text"
                        id="nom"
                        placeholder="Nom"
                        value={newAgent.nom}
                        onChange={(e) =>
                          setNewAgent({ ...newAgent, nom: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-600 font-medium mb-2"
                        htmlFor="prenom"
                      >
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        placeholder="Prénom"
                        value={newAgent.prenom}
                        onChange={(e) =>
                          setNewAgent({ ...newAgent, prenom: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-600 font-medium mb-2"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        value={newAgent.email}
                        onChange={(e) =>
                          setNewAgent({ ...newAgent, email: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                      <div>
                      <label
                        className="block text-gray-600 font-medium mb-2"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="Password"
                        placeholder="Password"
                        value={newAgent.password}
                        onChange={(e) =>
                          setNewAgent({ ...newAgent, password: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-600 font-medium mb-2"
                        htmlFor="telephone"
                      >
                        Téléphone
                      </label>
                      <input
                        type="text"
                        id="telephone"
                        placeholder="Téléphone"
                        value={newAgent.telephone}
                        onChange={(e) =>
                          setNewAgent({
                            ...newAgent,
                            telephone: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-600 font-medium mb-2"
                        htmlFor="cin"
                      >
                        CIN
                      </label>
                      <input
                        type="text"
                        id="cin"
                        placeholder="CIN"
                        value={newAgent.cin}
                        onChange={(e) =>
                          setNewAgent({ ...newAgent, cin: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </form>
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      onClick={handleAdd}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-300"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {agents.length === 0 ? (
              <p className="no-agents">Aucun agent à afficher</p>
            ) : (
              <table className="agents-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>CIN</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      {editingId === agent.id ? (
                        <>
                          <td>
                            <input
                              value={editAgent.nom}
                              onChange={(e) =>
                                setEditAgent({
                                  ...editAgent,
                                  nom: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              value={editAgent.prenom}
                              onChange={(e) =>
                                setEditAgent({
                                  ...editAgent,
                                  prenom: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              value={editAgent.email}
                              onChange={(e) =>
                                setEditAgent({
                                  ...editAgent,
                                  email: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              value={editAgent.telephone}
                              onChange={(e) =>
                                setEditAgent({
                                  ...editAgent,
                                  telephone: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              value={editAgent.cin}
                              onChange={(e) =>
                                setEditAgent({
                                  ...editAgent,
                                  cin: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <button
                              onClick={() => handleSave(agent.id)}
                              className="save-btn"
                            >
                              Sauvegarder
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="cancel-btn"
                            >
                              Annuler
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{agent.nom}</td>
                          <td>{agent.prenom}</td>
                          <td>{agent.email}</td>
                          <td>{agent.telephone}</td>
                          <td>{agent.cin}</td>
                          <td>
                            <button
                              onClick={() => startEdit(agent)}
                              className="edit-btn"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(agent.id)}
                              className="delete-btn"
                            >
                              Supprimer
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsList;

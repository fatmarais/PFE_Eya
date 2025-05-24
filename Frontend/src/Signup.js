// Signup.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [cin, setCin] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); 


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cin.length !== 8 || !/^\d+$/.test(cin)) {
      alert("Le CIN doit contenir exactement 8 chiffres.");
      return;
    }

    if (telephone.length !== 8 || !/^\d+$/.test(telephone)) {
      alert("Le numéro de téléphone doit contenir exactement 8 chiffres.");
      return;
    }
    const formData = {
      nom,
      prenom,
      cin,
      telephone,
      email,
      password,
      role,
    };
    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue.");
      }

      const data = await response.json();
      setMessage(data.message);
      setError("");
    } catch (err) {
      setError(err.message);
      setMessage("");
    }

  };

  return (
   <div className="flex h-screen">
  <div className="flex-1 flex flex-col justify-center items-center bg-white shadow-md p-8">
    <h2 className="text-2xl text-gray-800 mb-6">Inscription</h2>
    <form className="w-full max-w-sm" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nom"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />
      <input
        type="text"
        placeholder="Prénom"
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />
      <input
        type="text"
        placeholder="CIN"
        value={cin}
        onChange={(e) => setCin(e.target.value)}
        maxLength={8}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />
      <input
        type="text"
        placeholder="Numéro de téléphone"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        maxLength={8}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />
      <div className="flex justify-between items-center mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            value="agent"
            checked={role === "agent"}
            onChange={() => setRole("agent")}
            className="mr-2"
          />
          Agent
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="admin"
            checked={role === "admin"}
            onChange={() => setRole("admin")}
            className="mr-2"
          />
          Administrateur
        </label>
      </div>
      <button
        type="submit"
        className="w-full p-2 bg-gradient-to-r from-blue-700 to-purple-600 text-white rounded-md"
      >
        Inscription
      </button>
    </form>
    {message && <p className="text-green-500 mt-4">{message}</p>}
    {error && <p className="text-red-500 mt-4">{error}</p>}
    <p className="mt-4">
      Vous avez déjà un compte ?{" "}
      <Link to="/login" className="text-blue-500 underline">
        Connectez-vous
      </Link>
    </p>
  </div>
  <div className="flex-1 flex justify-center items-center bg-gradient-to-r from-blue-700 to-purple-600 text-white text-3xl font-bold">
    Tunisie Telecom
  </div>
</div>

  );
};

export default Signup;

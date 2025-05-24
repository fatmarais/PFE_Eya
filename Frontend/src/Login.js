import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { useAuth } from "./contexts/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { loginAction } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    try {
      await loginAction({ email, password });
    } catch (err) {
      setErrorMessage(err.message || "Une erreur est survenue");
    }
  };

  return (
   <div className="flex h-screen">
  <div className="flex-1 flex flex-col justify-center items-center bg-white shadow-md p-8">
    <h2 className="text-2xl text-gray-800 mb-6">Connexion</h2>
    <form className="w-full max-w-sm" onSubmit={handleSubmit}>
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
      <button
        type="submit"
        className="w-full p-2 bg-gradient-to-r from-blue-700 to-purple-600 text-white rounded-md"
      >
        Connexion
      </button>
    </form>
    {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    <p className="mt-4">
      Vous n'avez pas de compte ?{" "}
      <Link to="/signup" className="text-blue-500 underline">
        Inscrivez-vous
      </Link>
    </p>
  </div>
  <div className="flex-1 flex justify-center items-center bg-gradient-to-r from-blue-700 to-purple-600 text-white text-3xl font-bold">
    Tunisie Telecom
  </div>
</div>

  );
};

export default Login;
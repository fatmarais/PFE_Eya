import React from 'react';
import { Link } from 'react-router-dom';
import "./Sidebar.css";
import { useAuth } from './contexts/AuthProvider';

export default function Sidebar() {
  const { user, logOut } = useAuth();

  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        {/* ✅ Ce lien ne s'affiche que si le rôle est admin */}
        {user?.role === 'admin' && (
          <li>
            <Link to="/agentList">
              Consulter les agents
            </Link>
          </li>
        )}

        <li>
          <Link to="/host">
            Consulter les hôtes
          </Link>
        </li>
        <li>
          <Link to="/chat">
            Messages
          </Link>
        </li>
        <li>
          <Link to="/Map">
            Carte réseau
          </Link>
        </li>
      </ul>
      <button onClick={logOut} className="logout-button">
        Déconnexion
      </button>
    </div>
  );
}

import React from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import './Welcome.css';

const Welcome = ({ user }) => {
  return (
    <div className="admin-container">
      <Topbar />
      <div className="admin-content-wrapper">
        <Sidebar />
        <div className="main-content welcome-content">
          <div className="welcome-box">
            <h1>Bienvenue, <span className="username">{user?.name || 'Utilisateur'}</span> 👋</h1>
            <p className="welcome-text">Vous êtes connecté à la plateforme <strong>Telecom Monitoring</strong>.</p>
            <p className="welcome-sub">Surveillez et gérez vos équipements réseau avec efficacité.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

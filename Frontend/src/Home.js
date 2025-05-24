import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1 className="landing-title">Bienvenue sur Telecom Monitoring</h1>
        <p className="landing-subtitle">Surveillez vos équipements réseau en temps réel avec simplicité et efficacité.</p>
        <div className="landing-buttons">
          <Link to="/login" className="btn btn-primary">Se connecter</Link>
          <Link to="/signup" className="btn btn-outline">S'inscrire</Link>
        </div>
      </header>
      <section className="landing-info">
        <h2>Pourquoi choisir notre plateforme ?</h2>
        <ul>
          <li>Visualisation en temps réel de l'état réseau</li>
          <li>Alertes automatiques en cas de panne</li>
          <li>Interface intuitive et moderne</li>
          <li>Intégration facile avec Nagios XI</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;

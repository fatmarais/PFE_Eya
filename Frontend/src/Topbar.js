// src/components/Topbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Topbar.css';
import { useAuth } from './contexts/AuthProvider';

export default function Topbar() {
 const { user } = useAuth();
  
  const getInitials = () => {
    if (!user?.nom || !user?.prenom) return '';
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
  };
  return (
    <div className="topbar">
      <div className="title text-3xl font-bold underline"></div>
      <div className="profile-section">
        <Link to="/profile">
          <div className="contact-avatar">
            {getInitials(user.nom)}
          </div>
        </Link>
      </div>
    </div>
  );
}
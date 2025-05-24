import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import './Profile.css';
import { useAuth } from './contexts/AuthProvider';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState({
    nom: authUser?.nom || '',
    prenom: authUser?.prenom || '',
    cin: authUser?.cin || '',
    telephone: authUser?.telephone || '',
    email: authUser?.email || '',
    password: '********', // Password should be handled securely in a real app
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSave = () => {
    console.log('User data saved:', user);
    alert('Profil mis à jour !');
    // Here you would typically make an API call to update the user data
    // and then update the context with the new user data
  };

  return (
    <div className="admin-container">
      <Topbar />
      <div className="admin-content-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="profile-container">
            <h2 className="profile-title">Modifier le profil</h2>
            <form className="profile-form">
              <div className="form-group">
                <label className="form-label">Nom :</label>
                <input
                  type="text"
                  name="nom"
                  value={user.nom}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prénom :</label>
                <input
                  type="text"
                  name="prenom"
                  value={user.prenom}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">CIN :</label>
                <input
                  type="text"
                  name="cin"
                  value={user.cin}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone :</label>
                <input
                  type="text"
                  name="telephone"
                  value={user.telephone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email :</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled // Email is often not editable
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mot de passe :</label>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••" // Placeholder for password
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleSave}
                  className="save-button w-60"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function NetworkMap() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = "ceC9njcd5aFqemuJ9sdVAUBu6KXI9gYWYAWYNimDoOAQVF8DCB3eBnuc0rucrS4I";
  const apiUrl = `https://192.168.1.163/nagiosxi/api/v1/objects/hoststatus?pretty=1&apikey=${apiKey}`;

  useEffect(() => {
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Réponse API brute:", data);
        const list = data.hoststatus || [];

        const formatted = list.map(h => {
          const rawLast = h.last_check;
          const rawNext = h.next_check;

          const formatDate = raw => {
            if (!isNaN(Number(raw))) {
              const d = new Date(Number(raw) * 1000);
              return !isNaN(d.getTime()) ? d.toLocaleString("fr-FR") : "Date invalide";
            }
            if (typeof raw === "string" && raw.trim() !== "") return raw;
            return "Date invalide";
          };

          return {
            name: h.alias || h.host_name, // 👉 Afficher alias si dispo, sinon host_name
            address: h.address,
            status: ["UP", "DOWN", "UNREACHABLE", "UNKNOWN"][h.current_state] || "UNKNOWN",
            last_check: formatDate(rawLast),
            next_check: formatDate(rawNext),
          };
        });

        console.log("Hosts formatés:", formatted);
        setHosts(formatted);
      })
      .catch(err => {
        console.error("Erreur fetch:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiUrl]);

  const getStatusStyle = status => {
    const base = {
      fontWeight: 600,
      fontSize: "0.85rem",
      padding: "6px 14px",
      borderRadius: "999px",
      display: "inline-block",
      textAlign: "center",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      border: "1px solid transparent"
    };
    switch (status) {
      case "UP":
        return { ...base, backgroundColor: "#e3fcef", color: "#1b5e20", borderColor: "#a5d6a7" };
      case "DOWN":
        return { ...base, backgroundColor: "#ffebee", color: "#b71c1c", borderColor: "#ef9a9a" };
      case "UNREACHABLE":
        return { ...base, backgroundColor: "#fff8e1", color: "#ff6f00", borderColor: "#ffcc80" };
      default:
        return { ...base, backgroundColor: "#eceff1", color: "#37474f", borderColor: "#cfd8dc" };
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Topbar />
        <div style={{ padding: "2rem", textAlign: "center" }}>Chargement des hôtes…</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Topbar />
      <div className="admin-content-wrapper">
        <Sidebar />
        <div className="main-content">
          <div style={{
            padding: '2.5rem',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
            margin: '2rem',
            fontFamily: 'Roboto, Arial, sans-serif'
          }}>
            <h1 style={{
              marginBottom: '2rem',
              fontSize: '1.75rem',
              color: '#2c3e50',
              fontWeight: '700',
              borderBottom: '2px solid #ecf0f1',
              paddingBottom: '0.5rem'
            }}>🖥️ Supervision des hôtes réseau</h1>

            {error && (
              <p style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #ef9a9a'
              }}>{error}</p>
            )}

            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              backgroundColor: '#fafafa',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f4f8' }}>
                  <th style={thStyle}>Nom d’hôte</th>
                  <th style={thStyle}>Adresse IP</th>
                  <th style={thStyle}>État</th>
                  <th style={thStyle}>Dernière vérification</th>
                  <th style={thStyle}>Prochaine vérification</th>
                </tr>
              </thead>
              <tbody>
                {hosts.map((host, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={tdStyle}>{host.name}</td>
                    <td style={tdStyle}>{host.address}</td>
                    <td style={tdStyle}>
                      <span style={getStatusStyle(host.status)}>{host.status}</span>
                    </td>
                    <td style={tdStyle}>{host.last_check}</td>
                    <td style={tdStyle}>{host.next_check}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '14px 20px',
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#34495e',
  borderBottom: '1px solid #dfe6e9',
  textAlign: 'left'
};

const tdStyle = {
  padding: '14px 20px',
  fontSize: '0.9rem',
  color: '#2d3436',
  textAlign: 'left',
  borderBottom: '1px solid #f0f0f0'
};

export default NetworkMap;

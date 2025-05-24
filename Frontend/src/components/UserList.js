import { useEffect, useState } from "react";
import axios from "axios";


function UserList() {

    const [users, setUsers] = useState([]);
    useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/"
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des agents :", error);
      }
    };

    fetchAgents();
  }, []);
  return (
     <div className="contacts-list">
                {users.map(user => (
                  <div 
                    key={user.id}
                    className={`contact-card`}
                  >
                    <div className="contact-avatar">{user.nom.charAt(0)}</div>
                    <div className="contact-info">
                      <h3>{user.prenom} {user.nom}</h3>
                      {/* <p className="last-message">{user.lastMessage}</p> */}
                    </div>
                    {/* <div className="message-meta">
                      <span className="time">{user.time}</span>
                      {contact.unread > 0 && <span className="unread-count">{contact.unread}</span>}
                    </div> */}
                  </div>
                ))}
              </div>
  )
}

export default UserList
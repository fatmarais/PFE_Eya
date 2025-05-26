import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import './Messages.css';

// Initialize Socket.IO client
const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

const MessagesPage = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Jean Dupont', lastMessage: 'Bonjour, comment ça va?', time: '10:30', unread: 2 },
    { id: 2, name: 'Sophie Martin', lastMessage: 'Réunion à 15h', time: '09:45', unread: 0 },
    { id: 3, name: 'Pierre Bernard', lastMessage: 'J\'ai envoyé le document', time: 'Hier', unread: 0 },
    { id: 4, name: 'Julie Thomas', lastMessage: 'Merci pour votre aide!', time: 'Hier', unread: 1 },
    { id: 5, name: 'Luc Petit', lastMessage: 'À demain', time: 'Lundi', unread: 0 },
  ]);

  const [activeContact, setActiveContact] = useState(1);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Jean Dupont', text: 'Bonjour, comment ça va?', time: '10:30', sent: false },
    { id: 2, sender: 'Vous', text: 'Ça va bien merci!', time: '10:32', sent: true },
    { id: 3, sender: 'Jean Dupont', text: 'Avez-vous terminé le rapport?', time: '10:33', sent: false },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Set up Socket.IO event listeners
  useEffect(() => {
    // Handle connection
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server:', socket.id);
    });

    // Handle incoming chat messages
    socket.on('chat', (data) => {
      const { message, sender, time } = data;

      // Only add message if it's for the active contact
      if (sender === contacts.find(c => c.id === activeContact)?.name) {
        const newMsg = {
          id: messages.length + 1,
          sender,
          text: message,
          time,
          sent: false,
        };
        setMessages((prevMessages) => [...prevMessages, newMsg]);

        // Update contact's last message and time
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.id === activeContact
              ? { ...contact, lastMessage: message, time, unread: contact.unread + 1 }
              : contact
          )
        );
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    // Cleanup on component unmount
    return () => {
      socket.off('connect');
      socket.off('chat');
      socket.off('disconnect');
    };
  }, [activeContact, contacts, messages.length]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: messages.length + 1,
      sender: 'Vous',
      text: newMessage,
      time,
      sent: true,
    };

    // Emit the message to the Socket.IO server
    socket.emit('chat', {
      message: newMessage,
      sender: 'Vous',
      time,
    });

    // Add the message to the local state
    setMessages([...messages, newMsg]);

    // Update the active contact's last message and time
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === activeContact
          ? { ...contact, lastMessage: newMessage, time, unread: 0 }
          : contact
      )
    );

    setNewMessage('');
  };

  return (
    <div className="admin-container">
      {/* <Topbar />
      <div className="admin-content-wrapper">
        <Sidebar />
        
        <div className="main-content">
          <div className="messages-container">
            <div className="contacts-sidebar">
              <div className="sidebar-header">
                <h2>Messages</h2>
              </div>
              
              <div className="contacts-list">
                {contacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={`contact-card ${activeContact === contact.id ? 'active' : ''}`}
                    onClick={() => setActiveContact(contact.id)}
                  >
                    <div className="contact-avatar">{contact.name.charAt(0)}</div>
                    <div className="contact-info">
                      <h3>{contact.name}</h3>
                      <p className="last-message">{contact.lastMessage}</p>
                    </div>
                    <div className="message-meta">
                      <span className="time">{contact.time}</span>
                      {contact.unread > 0 && <span className="unread-count">{contact.unread}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-container">
              {activeContact ? (
                <>
                  <div className="chat-header">
                    <div className="contact-avatar large">
                      {contacts.find(c => c.id === activeContact).name.charAt(0)}
                    </div>
                    <h2>{contacts.find(c => c.id === activeContact).name}</h2>
                  </div>
                  
                  <div className="messages-area">
                    {messages.map(message => (
                      <div key={message.id} className={`message ${message.sent ? 'sent' : 'received'}`}>
                        <div className="message-content">
                          <p>{message.text}</p>
                          <span className="message-time">{message.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="message-input">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez un message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-chat-selected">
                  <p>Sélectionnez une conversation pour commencer à discuter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default MessagesPage;
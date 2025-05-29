import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useAuth } from "./contexts/AuthProvider";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Messages.css";

const Chat = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      console.log("No user available, skipping socket connection");
      return;
    }

    const userId = String(user.id); // Ensure string
    console.log("Connecting with userId:", userId, "Type:", typeof userId);
    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("Socket.IO connected with userId:", userId);
      if (activeContact) {
        axios
          .get(`http://localhost:5000/api/messages/${userId}/${activeContact}`)
          .then((response) => {
            console.log(`Fetched ${response.data.length} messages on connect`);
            setMessages(response.data || []);
          })
          .catch((error) => {
            console.error("Error fetching messages on connect:", error);
          });
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
    });

    // Heartbeat
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("ping");
      }
    }, 30000);

    setSocket(newSocket);

    return () => {
      clearInterval(heartbeatInterval);
      newSocket.disconnect();
      console.log("Socket disconnected");
    };
  }, [user, activeContact]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/");
        setContacts(
          response.data
            .filter((u) => user && String(u.id) !== String(user.id))
            .map((contact) => ({
              id: String(contact.id), // Ensure string
              name: `${contact.prenom} ${contact.nom}`,
              lastMessage: "Commencez à discuter!",
              time: "",
              unread: 0,
            }))
        );
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      }
    };

    fetchUsers();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeContact && user) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/messages/${String(user.id)}/${String(activeContact)}`
          );
          console.log(`Fetched ${response.data.length} messages for contact ${activeContact}`);
          setMessages(response.data || []);
        } catch (error) {
          console.error("Erreur lors de la récupération des messages:", error);
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    };

    fetchMessages();
  }, [activeContact, user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message", (payload) => {
      console.log("Received message:", payload);
      const { id, text, timestamp, senderId, recipientId, sent } = payload;

      setMessages((prev) => {
        if (prev.some((msg) => msg.id === id)) {
          console.log(`Duplicate message ID ${id} ignored`);
          return prev;
        }
        return [
          ...prev,
          {
            id,
            senderId: String(senderId), // Ensure string
            recipientId: String(recipientId), // Ensure string
            text,
            time: timestamp,
            sent,
          },
        ];
      });

      if (String(senderId) !== String(activeContact)) {
        setUnreadMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }

      setContacts((prev) =>
        prev.map((contact) =>
          String(contact.id) === String(senderId)
            ? { ...contact, lastMessage: text, time: timestamp }
            : contact
        )
      );
    });

    socket.on("pong", () => {
      console.log("Received pong from server");
    });

    return () => {
      socket.off("message");
      socket.off("pong");
    };
  }, [socket, activeContact]);

  const handleSendMessage = () => {
    if (newMessage.trim() && activeContact && user && socket && !isSending) {
      setIsSending(true);
      const messageId = Date.now().toString();
      const payload = {
        text: newMessage,
        senderId: String(user.id), // Ensure string
        recipientId: String(activeContact), // Ensure string
        messageId,
      };

      console.log("Sending message:", payload);
      socket.emit("message", payload);
      setNewMessage("");
      setTimeout(() => setIsSending(false), 500);
    }
  };

  const handleContactClick = (contactId) => {
    setActiveContact(String(contactId)); // Ensure string
    setUnreadMessages((prev) => ({ ...prev, [contactId]: 0 }));
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="admin-container">
      <Topbar />
      <div className="admin-content-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="messages-container">
            <div className="contacts-sidebar">
              <div className="sidebar-header">
                <h2>Messages</h2>
              </div>
              <div className="contacts-list">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`contact-card ${
                      String(activeContact) === String(contact.id) ? "active" : ""
                    }`}
                    onClick={() => handleContactClick(contact.id)}
                  >
                    <div className="contact-avatar">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="contact-info">
                      <h3>{contact.name}</h3>
                      <p className="last-message">{contact.lastMessage}</p>
                    </div>
                    <div className="message-meta">
                      <span className="time">{contact.time}</span>
                      {unreadMessages[contact.id] > 0 && (
                        <span className="unread-count">
                          {unreadMessages[contact.id]}
                        </span>
                      )}
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
                      {contacts
                        .find((c) => String(c.id) === String(activeContact))
                        ?.name.charAt(0)}
                    </div>
                    <h2>
                      {contacts.find((c) => String(c.id) === String(activeContact))
                        ?.name}
                    </h2>
                  </div>
                  <div className="messages-area">
                    {messages
                      .filter(
                        (msg) =>
                          String(msg.senderId) === String(activeContact) ||
                          String(msg.recipientId) === String(activeContact)
                      )
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`message ${
                            message.sent ? "sent" : "received"
                          }`}
                        >
                          <div className="message-content">
                            <p>{message.text}</p>
                            <span className="message-time">{message.time}</span>
                          </div>
                        </div>
                      ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="message-input">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez un message..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isSending) {
                          handleSendMessage();
                        }
                      }}
                    />
                    <button onClick={handleSendMessage} disabled={isSending}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
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
      </div>
    </div>
  );
};

export default Chat;
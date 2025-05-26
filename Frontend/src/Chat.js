import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useAuth } from "./contexts/AuthProvider";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import './Messages.css';


function Chat() {
  const { user } = useAuth();
  console.log("Current user in Chat:", user);

  const socket = io("http://localhost:5000", {
    withCredentials: true,
    transports: ["websocket", "polling"],
    query: { userId: user ? user.id : "anonymous" },
  });

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/");
        console.log("Fetched users:", response.data);
        setUsers(response.data);
        const initialUnread = response.data.reduce(
          (acc, user) => ({
            ...acc,
            [user.id]: 0,
          }),
          {}
        );
        setUnreadMessages(initialUnread);
      } catch (error) {
        console.error("Erreur lors de la récupération des agents :", error);
      }
    };

    fetchAgents();
  }, []);

useEffect(() => {
  socket.on("message", (payload) => {
    console.log("Received message:", payload);

    // Ignore the message if it's from the current user
    if (user && payload.senderId == user.id) {
      return;
    }

    setMessages((prevMessages) => [...prevMessages, payload]);

    // Update unread messages for the sender
    if (user && payload.senderId && payload.senderId !== user.id) {
      setUnreadMessages((prev) => {
        const newUnread = {
          ...prev,
          [payload.senderId]: (prev[payload.senderId] || 0) + 1,
        };
        console.log("Updated unreadMessages:", newUnread);
        return newUnread;
      });
    }
  });

  return () => {
    socket.off("message");
  };
}, [user]);


  const sendMessage = () => {
    if (message.trim() && user) {
      const timestamp = new Date().toLocaleString();
      const payload = {
        text: message,
        timestamp,
        senderId: user.id,
      };
      // Emit to server
      socket.emit("message", payload);

      // Add to local state for the sender
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...payload, id: "self" },
      ]);

      setMessage("");
    }
  };

  const handleUserClick = (userId) => {
    setUnreadMessages((prev) => ({
      ...prev,
      [userId]: 0,
    }));
  };

 return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Topbar */}
      <Topbar />

      {/* Main content area with Sidebar, User List, and Chat */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
<div className="main-content">
        {/* User List and Chat */}
        <div className="flex flex-1">
          {/* User List */}
          <div className="contacts-list w-1/4 bg-white shadow-lg overflow-y-auto">
            {users
              .filter((u) => user && u.id !== user.id) // Filter out the current user
              .map((user) => (
                <div
                  key={user.id}
                  className="contact-card p-4 border-b flex items-center cursor-pointer hover:bg-gray-100"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="contact-avatar bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">
                    {user.nom.charAt(0)}
                  </div>
                  <div className="contact-info">
                    <h3 className="font-bold text-sm">{user.prenom} {user.nom}</h3>
                    {unreadMessages[user.id] > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadMessages[user.id]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-4">
              <h1 className="text-xl font-bold text-center mb-4">Chat App</h1>
              <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded-lg mb-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded-lg flex flex-col ${
                      user && msg.senderId === user.id
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    <span>{msg.text}</span>
                    <span className="text-xs opacity-75">{msg.timestamp}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow p-2 border rounded-lg focus:outline-none"
                  placeholder="Type a message..."
                  disabled={!user}
                />
                <button
                  onClick={sendMessage}
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  disabled={!user}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Chat;

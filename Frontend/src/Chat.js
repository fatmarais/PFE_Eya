import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";


const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
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

  useEffect(() => {
    socket.on("message", (payload) => {
      setMessages((prevMessages) => [...prevMessages, payload]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { text: message, id: socket.id });
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message, id: "self" },
      ]);
      setMessage("");
    }
  };

  return (
   <div className="min-h-screen bg-gray-100 flex">
  {/* Contacts List */}
  <div className="contacts-list w-1/4 bg-white shadow-lg">
    {users.map((user) => (
      <div key={user.id} className="contact-card p-4 border-b flex items-center">
        <div className="contact-avatar bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">
          {user.nom.charAt(0)}
        </div>
        <div className="contact-info">
          <h3 className="font-bold">
            {user.prenom} {user.nom}
          </h3>
        </div>
      </div>
    ))}
  </div>

  {/* Chat Interface */}
  <div className="w-3/4 flex flex-col items-center justify-center">
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4">
      <h1 className="text-xl font-bold text-center mb-4">Chat App</h1>
      <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded-lg mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${
              msg.id === "self"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.text}
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
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</div>

  );
}

export default Chat;

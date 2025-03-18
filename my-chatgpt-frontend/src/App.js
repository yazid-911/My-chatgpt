
import React, { useState, useEffect } from 'react';
import { sendMessage, getConversations } from './api';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;

    try {
      const botResponse = await sendMessage(message);
      setConversation(prev => [
        ...prev,
        { role: 'user', text: message },
        { role: 'bot', text: JSON.stringify(botResponse) }
      ]);
      setMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  //l'historique des conversations
  const handleLoadConversations = async () => {
    try {
      const data = await getConversations();
      setConversation(data.flatMap(conv => conv.messages));
    } catch (error) {
      console.error(error);
    }
  };

  // Réinitialisee l'affichage pour démarrer une nouvelle conversation
  const handleNewChat = () => {
    setConversation([]);
  };

  useEffect(() => {

  }, []);

  return (
    <div className="app-container">
      <h1>Noesis</h1>
      
      <div className="buttons-container">
        <button onClick={handleLoadConversations}>Anciennes Conversations</button>
        <button onClick={handleNewChat}>Nouveau Chat</button>
      </div>
      
      <div className="chat-container">
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <span className="role">{msg.role === 'user' ? 'Vous' : 'Bot'}</span>: {msg.text}
          </div>
        ))}
      </div>
      
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Votre message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}

export default App;

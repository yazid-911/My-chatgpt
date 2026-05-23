import React, { useState } from 'react';
import { sendMessage, getConversations, extractReplyText } from './api';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState('');

  const formatConversationMessage = (msg) => {
    if (msg.role !== 'bot' || typeof msg.text !== 'string') {
      return msg;
    }

    try {
      const parsed = JSON.parse(msg.text);
      const extractedText = extractReplyText(parsed);
      return extractedText ? { ...msg, text: extractedText } : msg;
    } catch {
      return msg;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setError('');
      const currentMessage = message.trim();
      const botResponse = await sendMessage(currentMessage);

      setConversation((prev) => [
        ...prev,
        { role: 'user', text: currentMessage },
        { role: 'bot', text: botResponse.reply || 'Aucune reponse generee.' }
      ]);
      setMessage('');
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const handleLoadConversations = async () => {
    try {
      setError('');
      const data = await getConversations();
      setConversation(data.flatMap((conv) => conv.messages).map(formatConversationMessage));
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const handleNewChat = () => {
    setConversation([]);
    setError('');
  };

  return (
    <div className="app-container">
      <h1>Noesis</h1>

      <div className="buttons-container">
        <button onClick={handleLoadConversations}>Anciennes Conversations</button>
        <button onClick={handleNewChat}>Nouveau Chat</button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

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

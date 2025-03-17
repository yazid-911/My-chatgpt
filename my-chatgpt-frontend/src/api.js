const API_URL = 'http://localhost:3000/api';

export const sendMessage = async (message) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'envoi du message');
  }
  return response.json();
};

export const getConversations = async () => {
  const response = await fetch(`${API_URL}/conversations`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des conversations');
  }
  return response.json();
};

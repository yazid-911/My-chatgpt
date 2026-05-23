const API_URL = process.env.REACT_APP_API_URL || '/api';

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const extractReplyText = (payload) => {
  if (!payload) {
    return '';
  }

  if (typeof payload.reply === 'string') {
    return payload.reply.trim();
  }

  if (typeof payload.generated_text === 'string') {
    return payload.generated_text.trim();
  }

  if (Array.isArray(payload)) {
    return extractReplyText(payload[0]);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === 'string') {
    return content.trim();
  }

  return '';
};

export const sendMessage = async (message) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const details =
      typeof data?.details === 'string' && data.details
        ? `: ${data.details}`
        : '';
    throw new Error((data?.error || 'Erreur lors de l envoi du message') + details);
  }

  return {
    reply: extractReplyText(data),
    raw: data
  };
};

export const getConversations = async () => {
  const response = await fetch(`${API_URL}/conversations`);

  if (!response.ok) {
    throw new Error('Erreur lors de la recuperation des conversations');
  }

  return response.json();
};

const express = require('express');
const router = express.Router();
const axios = require('axios');
const Conversation = require('../models/conversation');

// Endpoint POST pour envoyer un message
router.post('/chat', async (req, res) => {
  console.log('Request body:', req.body);
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407',
      { inputs: message },
      {
        headers: { 
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const botResponse = response.data;
    
    // Enregistement de conversation
    const newConversation = new Conversation({
      messages: [
        { role: 'user', text: message },
        { role: 'bot', text: JSON.stringify(botResponse) }
      ]
    });
    await newConversation.save();

    res.json(botResponse);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching model response' });
  }
});

// endpoint GET pour récupérer lesconversations
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find();
    res.json(conversations);
  } catch (error) {
    console.error('Error retrieving conversations:', error);
    res.status(500).json({ error: 'Error retrieving conversations' });
  }
});

module.exports = router;

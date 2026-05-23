const express = require('express');
const axios = require('axios');
const Conversation = require('../models/Conversation');

const router = express.Router();

const HUGGINGFACE_API_URL =
  process.env.HUGGINGFACE_API_URL ||
  'https://router.huggingface.co/v1/chat/completions';

const HUGGINGFACE_MODEL =
  process.env.HUGGINGFACE_MODEL ||
  'katanemo/Arch-Router-1.5B:hf-inference';

const extractPrompt = (body = {}) => {
  const candidates = [body.message, body.query, body.inputs];
  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
};

const extractReplyText = (payload) => {
  if (!payload) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    return extractReplyText(payload[0]);
  }

  if (typeof payload.generated_text === 'string') {
    return payload.generated_text.trim();
  }

  if (typeof payload.reply === 'string') {
    return payload.reply.trim();
  }

  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === 'string') {
    return content.trim();
  }

  return '';
};

const formatUpstreamError = (error) => {
  const data = error.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data?.error === 'string') {
    return data.error;
  }

  if (typeof data?.message === 'string') {
    return data.message;
  }

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (data) {
    return JSON.stringify(data);
  }

  return error.message;
};

router.post('/chat', async (req, res) => {
  console.log('Request body:', req.body);

  const prompt = extractPrompt(req.body);
  if (!prompt) {
    return res.status(400).json({ error: 'A text prompt is required' });
  }

  if (!process.env.HUGGINGFACE_TOKEN) {
    return res.status(500).json({ error: 'HUGGINGFACE_TOKEN is not configured' });
  }

  try {
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      {
        model: HUGGINGFACE_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 256,
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const rawResponse = response.data;
    const reply = extractReplyText(rawResponse);

    if (!reply) {
      console.error('Unexpected Hugging Face response:', rawResponse);
      return res.status(502).json({
        error: 'Unexpected model response format',
        details: 'The upstream model did not return generated text.'
      });
    }

    const newConversation = new Conversation({
      messages: [
        { role: 'user', text: prompt },
        { role: 'bot', text: reply }
      ]
    });

    await newConversation.save();

    res.json({ reply, raw: rawResponse });
  } catch (error) {
    const details = formatUpstreamError(error);
    console.error('Error fetching model response:', details);
    res.status(502).json({
      error: 'Error fetching model response',
      details
    });
  }
});

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

const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407',
      { inputs: message },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching model response' });
  }
});

module.exports = router;
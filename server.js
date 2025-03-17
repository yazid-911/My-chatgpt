const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());

// Importer et utiliser les routes
const chatRouter = require('./routes/chat');
app.use('/api', chatRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

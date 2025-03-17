const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());

const chatRouter = require('./routes/chat');
app.use('/api', chatRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

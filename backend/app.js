const express = require('express');
const cors = require('cors');
const authRoutes = require('./router/authRoutes');
const port = process.env.PORT || 5000; 
const app = express();

app.use(cors());
app.use(express.json());
app.use(authRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}!`);
  });
}

module.exports = app; 

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./router/authRoutes');
const port = process.env.PORT || 5000; 
const cookieParser = require('cookie-parser');
const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL;


app.use(cookieParser());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(authRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}!`);
  });
}

module.exports = app; 

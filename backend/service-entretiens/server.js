require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const entretienRoutes = require('./routes/entretienRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connexion DB
connectDB();

// Routes
app.use('/entretients', entretienRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Service Entretiens démarré sur le port ${PORT}`);
}); 
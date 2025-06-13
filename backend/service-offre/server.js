require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('./config/db');
const offreRoutes = require('./routes/offreRoutes');
const errorHandler = require('./middleware/errorHandler');
const candidatOffreRoutes = require('./routes/candidatOffreRoutes');
require('./config/rabbitmq');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/offres', offreRoutes);
app.use('/candidatures', candidatOffreRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Offre service running on port ${PORT}`);
}); 
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middlewares/errorHandler');
require('./config/db');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors({ 
    origin: process.env.CORS_ORIGIN || '*', 
    credentials: true 
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));


// Routes
app.use('/api/auth', authRoutes);
// Health check endpoint

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
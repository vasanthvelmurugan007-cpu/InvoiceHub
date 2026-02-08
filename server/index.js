require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public')); // Serve uploads
const path = require('path');


// Routes
const { router: authRoutes, JWT_SECRET } = require('./authRoutes');
const routes = require('./routes');
const jwt = require('jsonwebtoken');

// Global Auth Middleware
app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) req.user = user;
            next();
        });
    } else {
        next();
    }
});

app.use('/api/auth', authRoutes);
app.use('/api', routes);

// Serve static frontend files (moved below API routes to avoid API requests being intercepted)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React Routing — fallback to index.html for non-API routes
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

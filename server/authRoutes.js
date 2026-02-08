const express = require('express');
const router = express.Router();
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login Route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Invalid username or password" });

        bcrypt.compare(password, user.password, (err, valid) => {
            if (err || !valid) return res.status(401).json({ error: "Invalid username or password" });

            // Check if 2FA is enabled
            if (user.two_factor_enabled) {
                // Return a temporary token for 2FA verification
                const tempToken = jwt.sign(
                    { id: user.id, partial_auth: true },
                    JWT_SECRET,
                    { expiresIn: '5m' }
                );
                return res.json({
                    success: true,
                    require2fa: true,
                    token: tempToken
                });
            }

            // Normal Login
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role, subscription_tier: user.subscription_tier },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({
                success: true,
                token,
                user: { id: user.id, username: user.username, role: user.role, subscription_tier: user.subscription_tier }
            });
        });
    });
});

// Verify 2FA (during login)
router.post('/2fa/verify', (req, res) => {
    const { token } = req.body;
    const authHeader = req.headers['authorization'];
    const tempJwt = authHeader && authHeader.split(' ')[1];

    if (!tempJwt) return res.status(401).json({ error: "No token" });

    jwt.verify(tempJwt, JWT_SECRET, (err, decoded) => {
        if (err || !decoded.partial_auth) return res.status(403).json({ error: "Invalid session" });

        db.get("SELECT * FROM users WHERE id = ?", [decoded.id], (err, user) => {
            if (err || !user) return res.status(404).json({ error: "User not found" });

            const verified = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: 'base32',
                token: token
            });

            if (verified) {
                const fullToken = jwt.sign(
                    { id: user.id, username: user.username, role: user.role, subscription_tier: user.subscription_tier },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                res.json({
                    success: true,
                    token: fullToken,
                    user: { id: user.id, username: user.username, role: user.role, subscription_tier: user.subscription_tier }
                });
            } else {
                res.status(400).json({ error: "Invalid 2FA Code" });
            }
        });
    });
});

// Setup 2FA (Generate Secret)
router.post('/2fa/setup', (req, res) => {
    // Middleware-like check: must have full auth (handled by global middleware check in index.js usually, but here we can check manually if needed or assume caller has validated)
    // Actually authRoutes is mounted at /api/auth/* which MIGHT NOT undergo the global middleware in index.js depending on order.
    // Looking at index.js: app.use('/api/auth', authRoutes). Global middleware is below? No, "Global Auth Middleware" is defined BUT it just sets req.user, it doesn't block.
    // So we need to protect this route manually or via middleware.

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Authentication required" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        if (decoded.partial_auth) return res.status(403).json({ error: "Complete login first" });

        // Generate secret
        const secret = speakeasy.generateSecret({ name: `BillingApp (${decoded.username})` });

        // Store secret temporarily (or permanently but keep disabled)
        db.run("UPDATE users SET two_factor_secret = ? WHERE id = ?", [secret.base32, decoded.id], (err) => {
            if (err) return res.status(500).json({ error: "Database error" });

            // Generate QR
            QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
                if (err) return res.status(500).json({ error: "QR generation failed" });
                res.json({ secret: secret.base32, qrCode: data_url });
            });
        });
    });
});

// Enable 2FA (Verify code to confirm setup)
router.post('/2fa/enable', (req, res) => {
    const { token } = req.body;
    const authHeader = req.headers['authorization'];
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) return res.status(401).json({ error: "Authentication required" });

    jwt.verify(jwtToken, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        db.get("SELECT two_factor_secret FROM users WHERE id = ?", [decoded.id], (err, user) => {
            if (err || !user) return res.status(404).json({ error: "User not found" });

            const verified = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: 'base32',
                token: token
            });

            if (verified) {
                db.run("UPDATE users SET two_factor_enabled = 1 WHERE id = ?", [decoded.id], (err) => {
                    if (err) return res.status(500).json({ error: "Database error" });
                    res.json({ success: true, message: "2FA Enabled Successfully" });
                });
            } else {
                res.status(400).json({ error: "Invalid Code. 2FA not enabled." });
            }
        });
    });
});

// Disable 2FA
router.post('/2fa/disable', (req, res) => {
    const authHeader = req.headers['authorization'];
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) return res.status(401).json({ error: "Authentication required" });

    jwt.verify(jwtToken, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        // In a real app, we should ask for a password or 2FA code again to disable.
        // For now, simpler flow.
        db.run("UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?", [decoded.id], (err) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ success: true, message: "2FA Disabled" });
        });
    });
});


// Register Route
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    db.get("SELECT id FROM users WHERE username = ?", [username], (err, existing) => {
        if (existing) return res.status(400).json({ error: "Username already exists" });

        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function (err) {
            if (err) return res.status(500).json({ error: "Failed to create user" });
            res.json({ success: true, message: "User created successfully" });
        });
    });
});

// Get Current User
router.get('/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        if (decoded.partial_auth) return res.status(403).json({ error: "2FA Verification Pending" });

        db.get("SELECT id, username, role, subscription_tier, subscription_expiry, two_factor_enabled FROM users WHERE id = ?", [decoded.id], (err, user) => {
            if (err || !user) return res.status(404).json({ error: "User not found" });
            res.json({ user });
        });
    });
});

module.exports = { router, JWT_SECRET };

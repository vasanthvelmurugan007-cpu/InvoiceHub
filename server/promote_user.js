const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../database/billing.sqlite');
const db = new sqlite3.Database(dbPath);

const username = 'vasanth';
const password = 'vasanth123';

db.serialize(() => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (row) {
            db.run("UPDATE users SET role = 'Admin', subscription_tier = 'Premium' WHERE username = ?", [username], (err) => {
                if (err) console.error('Error updating user:', err.message);
                else console.log(`User ${username} updated to Admin.`);
                db.close();
            });
        } else {
            const hashedPassword = bcrypt.hashSync(password, 10);
            db.run("INSERT INTO users (username, password, role, subscription_tier) VALUES (?, ?, 'Admin', 'Premium')", [username, hashedPassword], (err) => {
                if (err) console.error('Error creating user:', err.message);
                else console.log(`User ${username} created as Admin (Password: ${password}).`);
                db.close();
            });
        }
    });
});

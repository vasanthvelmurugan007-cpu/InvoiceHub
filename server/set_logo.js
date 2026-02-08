const db = require('./database');

db.serialize(() => {
    db.get("SELECT * FROM settings", (err, row) => {
        if (!row) {
            // No settings exist, create default with logo
            db.run("INSERT INTO settings (company_name, logo_url) VALUES ('My Company', '/logo.png')");
            console.log("Created new settings with Logo.");
        } else {
            // Settings exist, update logo
            db.run("UPDATE settings SET logo_url = '/logo.png'");
            console.log("Updated existing settings with Logo.");
        }
        setTimeout(() => process.exit(0), 1000);
    });
});

const db = require('./database');

db.serialize(() => {
    db.run("UPDATE settings SET logo_url = NULL");
    console.log("Invoice logo removed from settings.");
    setTimeout(() => process.exit(0), 1000);
});

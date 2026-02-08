const db = require('./database');

db.serialize(() => {
    db.run("DELETE FROM invoices");
    db.run("DELETE FROM invoice_items");
    db.run("DELETE FROM expenses"); // Optional, but usually part of a full reset
    console.log("Invoices and Expenses cleared.");
    process.exit(0);
});

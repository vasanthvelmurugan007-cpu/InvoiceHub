const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, '../database/billing.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Settings Table (Company Details)
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            company_name TEXT,
            address TEXT,
            gstin TEXT,
            phone TEXT,
            email TEXT,
            logo_url TEXT,
            bank_details TEXT,
            terms TEXT,
            state TEXT,
            subscription_tier TEXT DEFAULT 'Free',
            subscription_expiry TEXT,
            upi_id TEXT,
            signature_url TEXT,
            custom_field_label TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Migration for existing databases
        db.run("ALTER TABLE settings ADD COLUMN bank_details TEXT", (err) => { /* ignore */ });
        db.run("ALTER TABLE settings ADD COLUMN terms TEXT", (err) => { /* ignore */ });
        db.run("ALTER TABLE settings ADD COLUMN state TEXT", (err) => { /* ignore */ });
        db.run("ALTER TABLE settings ADD COLUMN signature_url TEXT", (err) => { /* ignore */ });
        db.run("ALTER TABLE settings ADD COLUMN subscription_tier TEXT DEFAULT 'Free'", (err) => { /* ignore */ });
        db.run("ALTER TABLE settings ADD COLUMN subscription_expiry TEXT", (err) => { /* ignore */ });
        db.run("ALTER TABLE settings ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });
        db.run("ALTER TABLE settings ADD COLUMN upi_id TEXT", (err) => { /* ignore */ });
        db.run("ALTER TABLE settings ADD COLUMN custom_field_label TEXT", (err) => { /* ignore */ });

        // Customers Table
        db.run(`CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            gstin TEXT,
            state TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
        db.run("ALTER TABLE customers ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });

        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            hsn_code TEXT,
            unit TEXT DEFAULT 'pcs',
            price REAL NOT NULL,
            tax_rate REAL DEFAULT 0,
            quantity REAL DEFAULT 0,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
        db.run("ALTER TABLE products ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });
        db.run("ALTER TABLE products ADD COLUMN quantity REAL DEFAULT 0", (err) => { /* ignore */ });



        // Vendors Table
        db.run(`CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            company_name TEXT NOT NULL,
            contact_person TEXT,
            email TEXT,
            phone TEXT,
            gstin TEXT,
            address TEXT,
            balance REAL DEFAULT 0,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
        db.run("ALTER TABLE vendors ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });

        // Expenses Table
        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            category TEXT,
            amount REAL,
            date TEXT,
            description TEXT,
            receipt_url TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
        db.run("ALTER TABLE expenses ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });

        // Estimates / Proforma Invoices
        db.run(`CREATE TABLE IF NOT EXISTS estimates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            estimate_number TEXT UNIQUE,
            customer_id INTEGER,
            date TEXT,
            valid_until TEXT,
            subtotal REAL,
            tax_total REAL,
            total REAL,
            status TEXT DEFAULT 'Draft', -- Draft, Sent, Accepted, Invoiced
            custom_field_value TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(customer_id) REFERENCES customers(id)
        )`);
        db.run("ALTER TABLE estimates ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });
        db.run("ALTER TABLE estimates ADD COLUMN custom_field_value TEXT", (err) => { /* ignore */ });

        db.run(`CREATE TABLE IF NOT EXISTS estimate_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            estimate_id INTEGER,
            product_id INTEGER,
            product_name TEXT,
            hsn_code TEXT,
            quantity REAL,
            unit TEXT,
            price REAL,
            tax_rate REAL,
            amount REAL,
            FOREIGN KEY(estimate_id) REFERENCES estimates(id)
        )`);

        // Purchase Orders (PO)
        db.run(`CREATE TABLE IF NOT EXISTS purchase_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            po_number TEXT UNIQUE,
            vendor_id INTEGER,
            date TEXT,
            expected_date TEXT,
            subtotal REAL,
            tax_total REAL,
            total REAL,
            status TEXT DEFAULT 'Open', -- Open, Closed, Billed
            custom_field_value TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(vendor_id) REFERENCES vendors(id)
        )`);
        db.run("ALTER TABLE purchase_orders ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });
        db.run("ALTER TABLE purchase_orders ADD COLUMN custom_field_value TEXT", (err) => { /* ignore */ });

        db.run(`CREATE TABLE IF NOT EXISTS po_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            po_id INTEGER,
            product_id INTEGER,
            product_name TEXT,
            hsn_code TEXT,
            quantity REAL,
            unit TEXT,
            price REAL,
            tax_rate REAL,
            amount REAL,
            FOREIGN KEY(po_id) REFERENCES purchase_orders(id)
        )`);

        // Delivery Challans (DC)
        db.run(`CREATE TABLE IF NOT EXISTS delivery_challans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            dc_number TEXT UNIQUE,
            customer_id INTEGER,
            date TEXT,
            vehicle_number TEXT,
            transport_mode TEXT,
            status TEXT DEFAULT 'Issued',
            custom_field_value TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(customer_id) REFERENCES customers(id)
        )`);
        db.run("ALTER TABLE delivery_challans ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });
        db.run("ALTER TABLE delivery_challans ADD COLUMN custom_field_value TEXT", (err) => { /* ignore */ });

        db.run(`CREATE TABLE IF NOT EXISTS dc_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dc_id INTEGER,
            product_id INTEGER,
            product_name TEXT,
            quantity REAL,
            unit TEXT,
            FOREIGN KEY(dc_id) REFERENCES delivery_challans(id)
        )`);

        // Invoices Table (Keeping existing, just ensuring structure)
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            invoice_number TEXT UNIQUE,
            customer_id INTEGER,
            date TEXT,
            due_date TEXT,
            po_number TEXT,
            vehicle_number TEXT,
            transport_mode TEXT,
            subtotal REAL,
            tax_total REAL,
            total REAL,
            status TEXT DEFAULT 'Unpaid',
            custom_field_value TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(customer_id) REFERENCES customers(id)
        )`);
        db.run("ALTER TABLE invoices ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });
        db.run("ALTER TABLE invoices ADD COLUMN custom_field_value TEXT", (err) => { /* ignore */ });

        // Invoice Items Table
        db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER,
            product_id INTEGER,
            product_name TEXT,
            hsn_code TEXT,
            quantity REAL,
            unit TEXT,
            price REAL,
            tax_rate REAL,
            amount REAL,
            FOREIGN KEY(invoice_id) REFERENCES invoices(id),
            FOREIGN KEY(product_id) REFERENCES products(id)
        )`);

        // Subscription Requests Table
        db.run(`CREATE TABLE IF NOT EXISTS subscription_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            transaction_id TEXT UNIQUE,
            amount REAL,
            date TEXT,
            status TEXT DEFAULT 'Pending',
            upi_used TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
        db.run("ALTER TABLE subscription_requests ADD COLUMN user_id INTEGER", (err) => { /* ignore */ });

        // Users Table for Auth & Management
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'User', -- Admin or User
            subscription_tier TEXT DEFAULT 'Free',
            subscription_expiry TEXT,
            two_factor_secret TEXT,
            two_factor_enabled INTEGER DEFAULT 0
        )`);

        // Add columns for 2FA if they don't exist
        db.run("ALTER TABLE users ADD COLUMN two_factor_secret TEXT", (err) => { /* ignore */ });
        db.run("ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0", (err) => { /* ignore */ });

        // Seed default Admin if not exists
        const bcrypt = require('bcryptjs');
        db.get("SELECT * FROM users WHERE username = 'admin'", [], (err, row) => {
            if (!row) {
                const hashedPassword = bcrypt.hashSync('admin123', 10);
                db.run("INSERT INTO users (username, password, role, subscription_tier) VALUES (?,?,?,?)",
                    ['admin', hashedPassword, 'Admin', 'Premium']);
                console.log('Default admin seeded (admin / admin123)');
            }
        });

        console.log('Database tables initialized.');
    });
}

module.exports = db;

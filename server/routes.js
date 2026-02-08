const express = require('express');
const router = express.Router();
const db = require('./database');
const { v4: uuidv4 } = require('uuid'); // Assuming uuid might be used later or just keeping imports clean


// Middleware to check for Premium subscription
const checkPremium = (req, res, next) => {
    // If not logged in, or Free tier, block
    if (!req.user || req.user.subscription_tier !== 'Premium') {
        return res.status(403).json({
            error: "Premium Feature Required",
            message: "This feature is only available for Premium users. Upgrade for ₹499/year."
        });
    }
    next();
};

// Middleware to check for Admin role
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

// Global authentication check for all routes in this file
router.use((req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }
    next();
});

// --- Customers ---
router.get('/customers', (req, res) => {
    db.all("SELECT * FROM customers WHERE user_id = ?", [req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

router.post('/customers', (req, res) => {
    const { name, email, phone, address, gstin, state } = req.body;
    db.run(`INSERT INTO customers (user_id, name, email, phone, address, gstin, state) VALUES (?,?,?,?,?,?,?)`,
        [req.user.id, name, email, phone, address, gstin, state],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

router.delete('/customers/:id', (req, res) => {
    db.run("DELETE FROM customers WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- Products ---
router.get('/products', (req, res) => {
    db.all("SELECT * FROM products WHERE user_id = ?", [req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});


router.post('/products', (req, res) => {
    const { name, description, hsn_code, unit, price, tax_rate, quantity } = req.body;
    db.run(`INSERT INTO products (user_id, name, description, hsn_code, unit, price, tax_rate, quantity) VALUES (?,?,?,?,?,?,?,?)`,
        [req.user.id, name, description, hsn_code, unit, price, tax_rate, quantity || 0],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});



// --- Invoices ---
router.get('/invoices', (req, res) => {
    const sql = `
        SELECT invoices.*, customers.name as customer_name 
        FROM invoices 
        LEFT JOIN customers ON invoices.customer_id = customers.id
        WHERE invoices.user_id = ?
        ORDER BY invoices.id DESC
    `;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

// --- Create Invoice ---
router.post('/invoices', (req, res) => {
    const {
        customer_id, date, due_date, po_number, vehicle_number,
        transport_mode, subtotal, tax_total, total, items,
        invoice_number: manual_invoice_number,
        custom_field_value
    } = req.body;

    // Use manual invoice number if provided, otherwise generate one
    const invoice_number = manual_invoice_number || `INV-${Date.now()}`;

    db.serialize(() => {
        db.run(`INSERT INTO invoices (
                user_id, invoice_number, customer_id, date, due_date, po_number, 
                vehicle_number, transport_mode, subtotal, tax_total, total, custom_field_value
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [req.user.id, invoice_number, customer_id, date, due_date, po_number, vehicle_number, transport_mode, subtotal, tax_total, total, custom_field_value],
            function (err) {
                if (err) return res.status(400).json({ error: err.message });
                const invoiceId = this.lastID;

                // Insert items
                const stmt = db.prepare(`INSERT INTO invoice_items (
                    invoice_id, product_id, product_name, hsn_code, 
                    quantity, unit, price, tax_rate, amount
                ) VALUES (?,?,?,?,?,?,?,?,?)`);

                // Prepare stock update statement
                const updateStock = db.prepare(`UPDATE products SET quantity = quantity - ? WHERE id = ?`);

                items.forEach(item => {
                    // Record Item
                    stmt.run(invoiceId, item.product_id, item.product_name, item.hsn_code,
                        item.quantity, item.unit, item.price, item.tax_rate, item.amount);

                    // Deduct Stock (if product_id exists)
                    if (item.product_id) {
                        updateStock.run(item.quantity, item.product_id);
                    }
                });

                stmt.finalize();
                updateStock.finalize(); // Ensure this runs

                res.json({ id: invoiceId, invoice_number });
            });
    });
});

router.get('/invoices/:id', (req, res) => {
    const invoiceId = req.params.id;
    db.get(`SELECT invoices.*, customers.name as customer_name, customers.address as customer_address, customers.gstin as customer_gstin
            FROM invoices 
            LEFT JOIN customers ON invoices.customer_id = customers.id
            WHERE invoices.id = ? AND invoices.user_id = ?`, [invoiceId, req.user.id], (err, invoice) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!invoice) return res.status(404).json({ error: "Invoice not found or unauthorized" });

        db.all(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [invoiceId], (err, items) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ invoice, items });
        });
    });
});

router.delete('/invoices/:id', (req, res) => {
    const invoiceId = req.params.id;
    db.serialize(() => {
        db.run("DELETE FROM invoice_items WHERE invoice_id = ? AND EXISTS (SELECT 1 FROM invoices WHERE id = ? AND user_id = ?)",
            [invoiceId, invoiceId, req.user.id]);

        db.run("DELETE FROM invoices WHERE id = ? AND user_id = ?", [invoiceId, req.user.id], function (err) {
            if (err) return res.status(400).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "Invoice not found/access denied" });
            res.json({ success: true });
        });
    });
});

// --- Vendors (Premium) ---
router.get('/vendors', checkPremium, (req, res) => {
    db.all("SELECT * FROM vendors WHERE user_id = ?", [req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

router.post('/vendors', checkPremium, (req, res) => {
    const { company_name, contact_person, email, phone, gstin, address } = req.body;
    db.run(`INSERT INTO vendors (user_id, company_name, contact_person, email, phone, gstin, address) VALUES (?,?,?,?,?,?,?)`,
        [req.user.id, company_name, contact_person, email, phone, gstin, address],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// --- Expenses (Premium) ---
router.get('/expenses', checkPremium, (req, res) => {
    db.all("SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC", [req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

router.post('/expenses', checkPremium, (req, res) => {
    const { category, amount, date, description } = req.body;
    db.run(`INSERT INTO expenses (user_id, category, amount, date, description) VALUES (?,?,?,?,?)`,
        [req.user.id, category, amount, date, description],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// --- Estimates (Premium) ---
router.get('/estimates', checkPremium, (req, res) => {
    const sql = `
        SELECT estimates.*, customers.name as customer_name 
        FROM estimates 
        LEFT JOIN customers ON estimates.customer_id = customers.id
        WHERE estimates.user_id = ?
        ORDER BY estimates.id DESC
    `;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

router.post('/estimates', checkPremium, (req, res) => {
    const { customer_id, date, valid_until, subtotal, tax_total, total, items } = req.body;
    const estimate_number = `EST-${Date.now()}`;

    db.serialize(() => {
        db.run(`INSERT INTO estimates (user_id, estimate_number, customer_id, date, valid_until, subtotal, tax_total, total, custom_field_value) 
                VALUES (?,?,?,?,?,?,?,?,?)`,
            [req.user.id, estimate_number, customer_id, date, valid_until, subtotal, tax_total, total, req.body.custom_field_value],
            function (err) {
                if (err) return res.status(400).json({ error: err.message });
                const estId = this.lastID;
                const stmt = db.prepare(`INSERT INTO estimate_items (estimate_id, product_id, product_name, hsn_code, quantity, unit, price, tax_rate, amount) VALUES (?,?,?,?,?,?,?,?,?)`);
                items.forEach(item => {
                    stmt.run(estId, item.product_id, item.product_name, item.hsn_code, item.quantity, item.unit, item.price, item.tax_rate, item.amount);
                });
                stmt.finalize();
                res.json({ id: estId, estimate_number });
            });
    });
});

// --- Purchase Orders (Premium) ---
router.get('/purchase-orders', checkPremium, (req, res) => {
    const sql = `
        SELECT purchase_orders.*, vendors.company_name as vendor_name 
        FROM purchase_orders 
        LEFT JOIN vendors ON purchase_orders.vendor_id = vendors.id
        WHERE purchase_orders.user_id = ?
        ORDER BY purchase_orders.id DESC
    `;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

router.post('/purchase-orders', checkPremium, (req, res) => {
    const { vendor_id, date, expected_date, subtotal, tax_total, total, items } = req.body;
    const po_number = `PO-${Date.now()}`;

    db.serialize(() => {
        db.run(`INSERT INTO purchase_orders (user_id, po_number, vendor_id, date, expected_date, subtotal, tax_total, total, custom_field_value) 
                VALUES (?,?,?,?,?,?,?,?,?)`,
            [req.user.id, po_number, vendor_id, date, expected_date, subtotal, tax_total, total, req.body.custom_field_value],
            function (err) {
                if (err) return res.status(400).json({ error: err.message });
                const poId = this.lastID;
                const stmt = db.prepare(`INSERT INTO po_items (po_id, product_id, product_name, hsn_code, quantity, unit, price, tax_rate, amount) VALUES (?,?,?,?,?,?,?,?,?)`);
                items.forEach(item => {
                    stmt.run(poId, item.product_id, item.product_name, item.hsn_code, item.quantity, item.unit, item.price, item.tax_rate, item.amount);
                });
                stmt.finalize();
                res.json({ id: poId, po_number });
            });
    });
});

// --- Delivery Challans (Premium) ---
router.get('/delivery-challans', checkPremium, (req, res) => {
    const sql = `
        SELECT delivery_challans.*, customers.name as customer_name 
        FROM delivery_challans 
        LEFT JOIN customers ON delivery_challans.customer_id = customers.id
        WHERE delivery_challans.user_id = ?
        ORDER BY delivery_challans.id DESC
    `;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

router.post('/delivery-challans', checkPremium, (req, res) => {
    const { customer_id, date, vehicle_number, transport_mode, items } = req.body;
    const dc_number = `DC-${Date.now()}`;

    db.serialize(() => {
        db.run(`INSERT INTO delivery_challans (user_id, dc_number, customer_id, date, vehicle_number, transport_mode, custom_field_value) 
                VALUES (?,?,?,?,?,?,?)`,
            [req.user.id, dc_number, customer_id, date, vehicle_number, transport_mode, req.body.custom_field_value],
            function (err) {
                if (err) return res.status(400).json({ error: err.message });
                const dcId = this.lastID;
                const stmt = db.prepare(`INSERT INTO dc_items (dc_id, product_id, product_name, quantity, unit) VALUES (?,?,?,?,?)`);
                items.forEach(item => {
                    stmt.run(dcId, item.product_id, item.product_name, item.quantity, item.unit);
                });
                stmt.finalize();
                res.json({ id: dcId, dc_number });
            });
    });
});

// --- Reports ---
router.get('/reports/dashboard', (req, res) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const queries = {
        sales_total: `SELECT SUM(total) as val FROM invoices WHERE user_id = ${req.user.id}`,
        monthly_sales: `SELECT SUM(total) as val FROM invoices WHERE date LIKE '${currentMonth}%' AND user_id = ${req.user.id}`,
        expenses_total: `SELECT SUM(amount) as val FROM expenses WHERE user_id = ${req.user.id}`,
        unpaid_invoices: `SELECT COUNT(*) as val FROM invoices WHERE status = 'Unpaid' AND user_id = ${req.user.id}`,
        invoice_count: `SELECT COUNT(*) as val FROM invoices WHERE user_id = ${req.user.id}`,
        stock_value: `SELECT SUM(price * 10) as val FROM products WHERE user_id = ${req.user.id}`
    };

    db.serialize(() => {
        const results = {};
        db.get(queries.sales_total, (err, row) => results.sales = row?.val || 0);
        db.get(queries.monthly_sales, (err, row) => results.monthly_sales = row?.val || 0);
        db.get(queries.expenses_total, (err, row) => results.expenses = row?.val || 0);
        db.get(queries.invoice_count, (err, row) => results.invoice_count = row?.val || 0);

        // Fetch last 15 days of sales for chart
        const salesTrendQuery = "SELECT date, SUM(total) as amount FROM invoices WHERE user_id = ? GROUP BY date ORDER BY date DESC LIMIT 15";
        db.all(salesTrendQuery, [req.user.id], (err, rows) => {
            results.salesTrend = (rows || []).reverse();

            // Fetch 5 most recent invoices
            const recentSql = `
                SELECT invoices.id, invoices.invoice_number, invoices.total, invoices.date, customers.name as customer_name 
                FROM invoices 
                LEFT JOIN customers ON invoices.customer_id = customers.id
                WHERE invoices.user_id = ?
                ORDER BY invoices.id DESC LIMIT 5
            `;
            db.all(recentSql, [req.user.id], (recentRows) => {
                results.recentInvoices = recentRows || [];
                db.get(queries.unpaid_invoices, (err, row) => {
                    results.unpaid = row?.val || 0;

                    // Low Stock Alert
                    db.all("SELECT name, quantity FROM products WHERE quantity < 20 AND user_id = ?", [req.user.id], (err, stockRows) => {
                        results.low_stock = stockRows || [];
                        res.json(results);
                    });
                });
            });
        });
    });
});

// GSTR1 Report (Premium)
router.get('/reports/gstr1', checkPremium, (req, res) => {
    const sql = `
        SELECT 
            i.invoice_number, i.date, i.total, i.subtotal, i.tax_total,
            c.name as customer_name, c.gstin as customer_gstin, c.state as customer_state,
            (SELECT state FROM settings WHERE user_id = ?) as company_state
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.user_id = ?
        LIMIT 1000
    `;

    db.all(sql, [req.user.id, req.user.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });

        const report = rows.map(inv => {
            const isInterState = inv.company_state && inv.customer_state &&
                inv.company_state.toLowerCase() !== inv.customer_state.toLowerCase();

            return {
                "Invoice No": inv.invoice_number,
                "Date": inv.date,
                "Customer": inv.customer_name,
                "GSTIN": inv.customer_gstin || "Unregistered",
                "Place of Supply": inv.customer_state,
                "Taxable Value": inv.subtotal,
                "IGST": isInterState ? inv.tax_total : 0,
                "CGST": !isInterState ? inv.tax_total / 2 : 0,
                "SGST": !isInterState ? inv.tax_total / 2 : 0,
                "Total Value": inv.total
            };
        });

        res.json({ data: report });
    });
});

// --- Settings ---


// Tax Summary (GSTR-3B Logic) - Compliance
router.get('/reports/tax-summary', checkPremium, (req, res) => {
    const { month } = req.query; // YYYY-MM
    let dateFilter = "";
    const params = [req.user.id];

    if (month) {
        dateFilter = "AND date LIKE ?";
        params.push(`${month}%`);
    }

    const queries = {
        output_tax: `SELECT SUM(tax_total) as val, SUM(subtotal) as taxable FROM invoices WHERE user_id = ? ${dateFilter}`,
        input_tax: `SELECT SUM(tax_total) as val, SUM(subtotal) as taxable FROM purchase_orders WHERE user_id = ? ${dateFilter}`,
    };

    db.serialize(() => {
        const results = {};
        // Output Tax (Sales)
        db.get(queries.output_tax, params, (err, row) => {
            if (err) return res.status(400).json({ error: err.message });
            results.output = { tax: row?.val || 0, taxable: row?.taxable || 0 };

            // Input Tax (Purchases)
            // Note: In real world, we only claim IT on 'Billed' POs, but for now take all to show potential
            db.get(queries.input_tax, params, (err, row) => {
                if (err) return res.status(400).json({ error: err.message });
                results.input = { tax: row?.val || 0, taxable: row?.taxable || 0 };

                results.net_payable = results.output.tax - results.input.tax;
                res.json({ data: results });
            });
        });
    });
});

// --- Settings ---
router.get('/settings', (req, res) => {
    db.get("SELECT * FROM settings WHERE user_id = ?", [req.user.id], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        const settings = row || {};
        // Default logo if not set
        if (!settings.logo_url) settings.logo_url = '/logo.png';
        res.json({ data: settings });
    });
});

// Database Backup Endpoint - Reliability
router.get('/settings/backup', (req, res) => {
    const path = require('path');
    const dbPath = path.resolve(__dirname, '../database/billing.sqlite');
    res.download(dbPath, `billing-backup-${new Date().toISOString().split('T')[0]}.sqlite`);
});

router.post('/settings', (req, res) => {
    const fields = ['company_name', 'address', 'gstin', 'email', 'phone', 'bank_details', 'terms', 'state', 'signature_url', 'logo_url', 'upi_id', 'custom_field_label'];
    const updates = [];
    const values = [];

    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });

    if (updates.length === 0) return res.json({ success: true, message: "No fields to update" });

    values.push(req.user.id);

    // Check if settings exist for user
    db.get("SELECT id FROM settings WHERE user_id = ?", [req.user.id], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });

        if (row) {
            // Update existing
            const updates = [];
            const values = [];
            fields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    values.push(req.body[field]);
                }
            });

            if (updates.length === 0) return res.json({ success: true, message: "No fields to update" });

            values.push(row.id);
            const sql = `UPDATE settings SET ${updates.join(', ')} WHERE id = ?`;

            db.run(sql, values, function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ success: true });
            });
        } else {
            // Insert new
            const insertFields = ['user_id'];
            const insertPlaceholders = ['?'];
            const insertValues = [req.user.id];

            fields.forEach(field => {
                if (req.body[field] !== undefined) {
                    insertFields.push(field);
                    insertPlaceholders.push('?');
                    insertValues.push(req.body[field]);
                }
            });

            const sql = `INSERT INTO settings (${insertFields.join(', ')}) VALUES (${insertPlaceholders.join(', ')})`;

            db.run(sql, insertValues, function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ success: true });
            });
        }
    });
});

// --- Subscription Management ---
router.get('/subscription/status', (req, res) => {
    db.get("SELECT subscription_tier, subscription_expiry FROM settings WHERE user_id = ?", [req.user.id], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: row || { subscription_tier: 'Free', subscription_expiry: null } });
    });
});

// --- Subscription Requests (Manual Flow) ---
router.post('/subscription/request', (req, res) => {
    const { transaction_id, upi_used } = req.body;
    const date = new Date().toISOString();
    const amount = 1000; // Lifetime Access Price

    db.run(`INSERT INTO subscription_requests (user_id, transaction_id, amount, date, status, upi_used) VALUES (?,?,?,?,?,?)`,
        [req.user.id, transaction_id, amount, date, 'Pending', upi_used],
        function (err) {
            if (err) return res.status(400).json({ error: "Transaction ID already exists or invalid data." });
            res.json({ success: true, id: this.lastID });
        });
});

router.get('/subscription/requests', (req, res) => {
    db.all("SELECT * FROM subscription_requests ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

router.post('/subscription/requests/:id/approve', (req, res) => {
    const requestId = req.params.id;
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 100); // 100 Years (Lifetime)
    const expiryISO = expiryDate.toISOString().split('T')[0];

    db.serialize(() => {
        db.run("UPDATE subscription_requests SET status = 'Approved' WHERE id = ?", [requestId]);
        db.run("UPDATE settings SET subscription_tier = 'Premium', subscription_expiry = ?", [expiryISO], (err) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// --- User Management (Admin Only) ---
router.get('/users', isAdmin, (req, res) => {
    db.all("SELECT id, username, role, subscription_tier, subscription_expiry FROM users", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

router.post('/users', isAdmin, (req, res) => {
    const { username, password, role, subscription_tier } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`INSERT INTO users (username, password, role, subscription_tier) VALUES (?,?,?,?)`,
        [username, hashedPassword, role || 'User', subscription_tier || 'Free'],
        function (err) {
            if (err) return res.status(400).json({ error: "Username already exists" });
            res.json({ id: this.lastID });
        });
});

router.post('/users/:id/tier', isAdmin, (req, res) => {
    const { subscription_tier } = req.body;
    const expiryDate = subscription_tier === 'Premium' ? new Date() : null;
    if (expiryDate) expiryDate.setFullYear(expiryDate.getFullYear() + 100);
    const expiryISO = expiryDate ? expiryDate.toISOString().split('T')[0] : null;

    db.run("UPDATE users SET subscription_tier = ?, subscription_expiry = ? WHERE id = ?",
        [subscription_tier, expiryISO, req.params.id],
        (err) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ success: true, tier: subscription_tier, expiry: expiryISO });
        });
});

router.delete('/users/:id', isAdmin, (req, res) => {
    db.run("DELETE FROM users WHERE id = ? AND username != 'admin'", [req.params.id], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });
});



module.exports = router;

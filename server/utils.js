const db = require('./database');

const crud = (tableName) => ({
    getAll: (req, res) => {
        db.all(`SELECT * FROM ${tableName} ORDER BY id DESC`, [], (err, rows) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ data: rows });
        });
    },
    create: (fields) => (req, res) => {
        const placeholders = fields.map(() => '?').join(',');
        const values = fields.map(f => req.body[f]);
        const sql = `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders})`;

        db.run(sql, values, function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID });
        });
    },
    // Document specific create with items
    createDocument: (docTable, itemTable, docFields, itemFields, foreignKey) => (req, res) => {
        const docValues = docFields.map(f => req.body[f]);
        // Auto-generate number if needed (simplified)
        if (docFields.includes('number') && !req.body['number']) {
            // Logic handled in route usually
        }

        const placeholders = docFields.map(() => '?').join(',');
        const sql = `INSERT INTO ${docTable} (${docFields.join(',')}) VALUES (${placeholders})`;

        db.serialize(() => {
            db.run(sql, docValues, function (err) {
                if (err) return res.status(400).json({ error: err.message });
                const docId = this.lastID;

                const itemPlaceholders = itemFields.map(() => '?').join(',');
                const stmt = db.prepare(`INSERT INTO ${itemTable} (${foreignKey}, ${itemFields.join(',')}) VALUES (?, ${itemPlaceholders})`);

                (req.body.items || []).forEach(item => {
                    const itemValues = [docId, ...itemFields.map(f => item[f])];
                    stmt.run(itemValues);
                });
                stmt.finalize();
                res.json({ id: docId });
            });
        });
    }
});

module.exports = crud;

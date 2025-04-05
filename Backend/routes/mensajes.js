const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/enviar", (req, res) => {
    const { contenido, remitente_id, destinatario_id, grupo_id, tipo } = req.body;

    const query = `INSERT INTO Mensajes (contenido, remitente_id, destinatario_id, grupo_id, tipo) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [contenido, remitente_id, destinatario_id, grupo_id, tipo], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message_id: result.insertId });
    });
});

router.get("/obtener/:remitente_id/:destinatario_id", (req, res) => {
    const { remitente_id, destinatario_id } = req.params;
    
    const query = `
        SELECT * 
        FROM Mensajes 
        WHERE (remitente_id = ? AND destinatario_id = ?)
        OR (remitente_id = ? AND destinatario_id = ?)
        ORDER BY fecha
    `;
    
    db.query(query, 
        [remitente_id, destinatario_id, destinatario_id, remitente_id], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

router.get("/obtener/:idChat", (req, res) => {
    const idChat = req.params.idChat;
    const query = `SELECT * FROM Mensajes WHERE grupo_id = ? OR destinatario_id = ?`;
    
    db.query(query, [idChat, idChat], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

module.exports = router;

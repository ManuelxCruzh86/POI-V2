const express = require("express");
const router = express.Router();
const db = require("../db").promise();

router.post("/privado", async (req, res) => {
  const { remitente_id, destinatario_id, contenido, es_cifrado, tipo, grupo_id } = req.body;

  try {
    await db.query(
      "INSERT INTO mensajes (remitente_id, destinatario_id, contenido, es_cifrado, tipo, grupo_id) VALUES (?, ?, ?, ?, ?, ?)",
      [remitente_id, destinatario_id, contenido, es_cifrado, tipo, grupo_id]
    );

    // ✅ usa req.io aquí (¡aquí sí existe!)
    req.io.to(destinatario_id.toString()).emit("nuevo_mensaje", {
      remitente_id,
      contenido,
      es_cifrado,
      tipo,
      fecha: new Date()
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error al guardar mensaje:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/conversacion", async (req, res) => {
  const { usuario1, usuario2, grupoId } = req.query;

  try {
    const [rows] = await db.query(`
       SELECT m.*, u.nombre as remitente_nombre 
      FROM mensajes m
      JOIN usuarios u ON m.remitente_id = u.id
      WHERE ((m.remitente_id = ? AND m.destinatario_id = ?) 
         OR (m.remitente_id = ? AND m.destinatario_id = ?))
         ${grupoId ? 'AND m.grupo_id = ?' : 'AND m.grupo_id IS NULL'}
      ORDER BY m.fecha ASC
    `, grupoId 
      ? [usuario1, usuario2, usuario2, usuario1, grupoId]
      : [usuario1, usuario2, usuario2, usuario1]);

    res.json({ success: true, mensajes: rows });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ success: false });
  }
});


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

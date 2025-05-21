const express = require("express");
const router = express.Router();
const db = require("../db").promise();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const brcypt = require('bcrypt');

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Carpeta "uploads" creada.');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // crea la carpeta si no existe
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });


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

router.get("/descargar/:nombre", (req, res) => {
  const nombre = req.params.nombre;
  const ruta = path.join(__dirname, "..", "uploads", nombre);

  res.download(ruta, nombre, (err) => {
    if (err) {
      console.error("Error al descargar:", err);
      res.status(500).send("Error al descargar el archivo");
    }
  });
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

router.post("/archivo", upload.single("archivo"), async (req, res) => {
    console.log("📦 Entrando al endpoint /archivo");
  const { remitente_id, destinatario_id, grupo_id, es_cifrado } = req.body;
  const archivo = req.file;

  if (!archivo) {
        console.log("❌ No se recibió archivo");
    return res.status(400).json({ success: false, error: "No se proporcionó archivo" });
  }

  try {
    // Guarda el mensaje de tipo archivo
        console.log("✅ Archivo recibido:", archivo.originalname);
    const [resultado] = await db.query(
      "INSERT INTO mensajes (remitente_id, destinatario_id, grupo_id, contenido, es_cifrado, tipo) VALUES (?, ?, ?, ?, ?, ?)",
      [remitente_id, destinatario_id, grupo_id || null, archivo.filename, es_cifrado || 0, "archivo"]
    );

    const mensajeId = resultado.insertId;

    // Guarda la info del archivo (opcional, pero recomendado)
    await db.query(
      "INSERT INTO archivos (url, nombre, tipo, mensaje_id) VALUES (?, ?, ?, ?)",
      [`/uploads/${archivo.filename}`, archivo.originalname, archivo.mimetype, mensajeId]
    );

    // Emitir evento a socket para que se refleje en el chat del destinatario
    req.io.to(destinatario_id.toString()).emit("nuevo_mensaje", {
      remitente_id,
      contenido: archivo.originalname,
      archivo: `http://10.100.225.56:3001/uploads/${archivo.filename}`,
      tipo: "archivo",
      es_cifrado: es_cifrado || 0,
      fecha: new Date()
    });

    // Enviar respuesta completa
    res.status(200).json({
      success: true,
      archivo: archivo.filename,
      mensaje: {
        id: mensajeId,
        contenido: archivo.originalname,
        archivo: `http://10.100.225.56:3001/uploads/${archivo.filename}`,
        tipo: "archivo"
      }
    });
  } catch (err) {
    console.error("Error al guardar archivo:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
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

//GRUPALES
router.get("/conversacion-grupo", async (req, res) => {
  const { grupo_id } = req.query;

  if (!grupo_id) {
    return res.status(400).json({ success: false, error: "Se requiere el ID del grupo" });
  }

  try {
    const [mensajes] = await db.query(`
      SELECT 
        mg.id,
        mg.mensaje,
        mg.created_at,
        u.id as usuario_id,
        u.nombre as usuario_nombre
      FROM MensajesGrupales mg
      JOIN Usuarios u ON mg.usuario_id = u.id
      WHERE mg.grupo_id = ?
      ORDER BY mg.created_at ASC
    `, [grupo_id]);

    res.json({ success: true, mensajes });
  } catch (error) {
    console.error("Error al obtener mensajes grupales:", error);
    res.status(500).json({ success: false, error: "Error del servidor" });
  }
});

router.post("/enviar-grupo", async (req, res) => {
  const { grupo_id, usuario_id, mensaje } = req.body;

  if (!grupo_id || !usuario_id || !mensaje) {
    return res.status(400).json({ 
      success: false, 
      error: "Faltan campos requeridos (grupo_id, usuario_id, mensaje)" 
    });
  }

  try {
    const [result] = await db.query(`
      INSERT INTO MensajesGrupales 
        (grupo_id, usuario_id, mensaje) 
      VALUES 
        (?, ?, ?)
    `, [grupo_id, usuario_id, mensaje]);

    const [mensajeCreado] = await db.query(`
      SELECT 
        mg.*,
        u.nombre as usuario_nombre,
        u.avatar_url
      FROM MensajesGrupales mg
      JOIN Usuarios u ON mg.usuario_id = u.id
      WHERE mg.id = ?
    `, [result.insertId]);

    res.json({ 
      success: true, 
      mensaje: mensajeCreado[0] 
    });
  } catch (error) {
    console.error("Error al crear mensaje grupal:", error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        success: false, 
        error: "El grupo o usuario no existe" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Error del servidor al crear mensaje" 
    });
  }
});

module.exports = router;

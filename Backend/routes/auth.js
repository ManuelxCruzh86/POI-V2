const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db"); // Importa tu conexión a la base de datos
const router = express.Router();

const SECRET_KEY = "tu_clave_secreta"; // Cambia esto a una variable de entorno

// 📌 Registro de usuario (Guarda la contraseña en texto plano)
router.post("/register", async (req, res) => {
    const { nombre, email, password } = req.body;

    db.query(
        "INSERT INTO Usuarios (nombre, email, password_hash) VALUES (?, ?, ?)",
        [nombre, email, password],  // Aquí se guarda la contraseña sin cifrar
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Usuario registrado correctamente" });
        }
    );
});

// 📌 Login de usuario (Valida la contraseña sin encriptación)
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM Usuarios WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: "Usuario no encontrado" });

        const user = results[0];

        // 📌 Compara directamente la contraseña con la guardada en la BD
        if (password !== user.password_hash) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign({ id: user.id, nombre: user.nombre, email: user.email }, SECRET_KEY, {
            expiresIn: "1h",
        });

        res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email } });
    });
});

// 📌 Obtener perfil
router.get("/perfil", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Token no proporcionado" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token inválido" });
        res.json(decoded);
    });
});

module.exports = router;

// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mensajes = require("./routes/mensajes"); 
const authRoutes = require("./routes/auth");
const db = require("./db");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "tu_clave_secreta";

const app = express();
const server = http.createServer(app);

/* const io= require('socket.io')(server,{
    cors:{origin: '*'}
}); */

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5179", // pon el puerto correcto de tu frontend
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Se ha conectado un nuevo cliente:', socket.id);
    
    // Generar un nombre de usuario único temporal (ej: Usuario_ABC123)
    const nombreUsuario = `Usuario_${socket.id.slice(0, 6).toUpperCase()}`;
    console.log('Enviando nombre de usuario:', nombreUsuario);

    // Enviar al cliente su nombre de usuario
    socket.emit('configuracion_inicial', {
        usuario: nombreUsuario
    });

    socket.on('chat_message', (data) => {
        console.log('Mensaje recibido:', data);
        io.emit('chat_message', {
            usuario: data.usuario,
            mensaje: data.mensaje
        });
    });
});


/* const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5177", // Asegúrate que coincide con tu puerto de frontend
        methods: ["GET", "POST"],
        credentials: true
    }
}); */

const obtenerUsuariosConectados = async () => {
    try {
        const [results] = await db.promise().query(
            'SELECT id, nombre, email, conectado FROM Usuarios'
        );
        return results;
    } catch (error) {
        console.error("Error obteniendo usuarios:", error);
        return [];
    }
};

app.use(cors({
    origin: "http://localhost:5178",
    credentials: true
}));
app.use(express.json());

// Rutas
app.use("/auth", authRoutes);

app.use((req, res) => {
    res.status(404).json({ 
        error: "Ruta no encontrada",
        mensaje: "La URL solicitada no existe en este servidor"
    });
});


server.listen(3001, () => {
    console.log("Servidor corriendo en el puerto 3001");
});


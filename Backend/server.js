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
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const mensajesRouter = require("./routes/mensajes");


/* const io= require('socket.io')(server,{
    cors:{origin: '*'}
}); */

const io = socketIo(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: true
        
    }
});

io.on('connection', (socket) => {
    console.log('Se ha conectado un nuevo cliente:', socket.id);
    
    // Nombre de usuario único temporal 
    const nombreUsuario = `Usuario_${socket.id.slice(0, 6).toUpperCase()}`;
    console.log('Enviando nombre de usuario:', nombreUsuario);

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
    origin: "*",
    credentials: true
}));
app.use(express.json());

// Inyectar io primero
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas válidas
app.use("/auth", authRoutes);
app.use("/mensajes", mensajesRouter);
app.use('/Imagenes', express.static(path.join(__dirname, 'Imagenes')));

// Siempre el 404 debe ser el ÚLTIMO
app.use((req, res) => {
  res.status(404).json({ 
    error: "Ruta no encontrada"
  });
});

server.listen(3001, '0.0.0.0', () => {
    console.log("Servidor corriendo en el puerto 3001");
});


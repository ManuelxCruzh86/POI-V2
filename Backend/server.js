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
        origin: "http://localhost:5178", // pon el puerto correcto de tu frontend
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Se ha conectado un nuevo cliente:');

    /* socket.broadcast.emit('chat_message',{
        usuario: 'INFO',
        mensaje: 'Se ha conectado un nuevo usuario'
    }); */

    socket.on('chat_message', (data) => {
        io.emit('chat_message', {
            usuario:data.usuario || 'Anonimo',
        mensaje:data.mensaje
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


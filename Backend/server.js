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


const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5177", // Asegúrate que coincide con tu puerto de frontend
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Función para obtener usuarios conectados
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

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/mensajes", mensajes);
app.use("/auth", authRoutes);

app.use((req, res) => {
    res.status(404).json({ 
        error: "Ruta no encontrada",
        mensaje: "La URL solicitada no existe en este servidor"
    });
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return next(new Error("Autenticación fallida"));
        socket.userId = user.id;
        next();
    });
});

// Manejar conexiones Socket.io
io.on("connection", async (socket) => {
    console.log("Usuario conectado:", socket.id, "User ID:", socket.userId);



    socket.on("mensaje", (mensajeData) => {
        try {
            const mensaje = {
                ...mensajeData,
                fecha: new Date()
            };
    
            // Emitir a AMBOS usuarios
            io.to(mensajeData.destinatario_id).emit("mensaje_privado", mensaje);
            io.to(mensajeData.remitente_id).emit("mensaje_privado", mensaje);
            
        } catch (error) {
            console.error("Error:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
    });

});

server.listen(3001, () => {
    console.log("Servidor corriendo en el puerto 3001");
});


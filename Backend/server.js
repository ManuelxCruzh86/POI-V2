const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mensajes = require("./routes/mensajes"); 
const authRoutes = require("./routes/auth");
const db = require("./db");



const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5175", // URL de tu frontend
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());


// Rutas
app.use("/routes/mensajes", mensajes); 
app.use("/auth", authRoutes);




io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("mensaje", ({ remitente_id, destinatario_id, grupo_id, contenido, tipo }) => {
        const query = "INSERT INTO Mensajes (remitente_id, destinatario_id, grupo_id, contenido, tipo) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [remitente_id, destinatario_id || null, grupo_id || null, contenido, tipo], (err, result) => {
            if (err) {
                console.error("Error al guardar el mensaje:", err);
                return;
            }

            const mensajeGuardado = {
                id: result.insertId,
                remitente_id,
                destinatario_id,
                grupo_id,
                contenido,
                tipo,
                fecha: new Date(),
            };

            if (destinatario_id) {
                io.to(destinatario_id).emit("mensaje_recibido", mensajeGuardado);
                io.to(remitente_id).emit("mensaje_recibido", mensajeGuardado);
            } else {
                io.emit("mensaje_grupal", mensajeGuardado);
            }
        });
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
    });
});

server.listen(3001, () => {
    console.log("Servidor corriendo en el puerto 3001");});

app.listen(5000, () => 
    console.log("Servidor corriendo en el puerto 5000"));


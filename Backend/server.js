const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mensajes = require("./routes/mensajes"); // Importa el router de mensajes
const authRoutes = require("./routes/auth");



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
app.use("/routes/mensajes", mensajes); // Agrega el router de mensajes
app.use("/auth", authRoutes);



io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("mensaje_privado", (data) => {
        io.to(data.destinatario).emit("recibir_mensaje", data);
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
    });
});

server.listen(3001, () => {
    console.log("Servidor corriendo en el puerto 3001");});

app.listen(5000, () => 
    console.log("Servidor corriendo en el puerto 5000"));


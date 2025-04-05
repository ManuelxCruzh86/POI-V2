import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const token = localStorage.getItem("token");
const socket = io("http://localhost:3001", {
  auth: { token },
  withCredentials: true
});

function ChatIndividual() {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [nombreUser, setNombreUser] = useState("");
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: "Juan", estado: "", activo: 1 },
    { id: 2, nombre: "Ana", estado: "", activo: 0 },
    { id: 3, nombre: "Carlos", estado: "", activo: 0 },
    { id: 4, nombre: "María", estado: "", activo: 0 },
  ]);
  
  const { receiverId } = useParams(); // Obtiene el ID de la URL
  const userId = localStorage.getItem("userId");
  const mensajesContainerRef = useRef(null);
  const usuarioActivo = usuarios.find(u => u.id === parseInt(receiverId));


  // Nuevo efecto para cargar usuarios y socket
  useEffect(() => {
    // Cargar usuarios conectados
    const cargarUsuarios = async () => {
        try {
            const response = await fetch("http://localhost:3001/auth/usuarios");
            const data = await response.json();
            setUsuarios(data);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        }
    };

    const cargarHistorial = async () => {
      try {
          const response = await fetch(
              `http://localhost:3001/api/mensajes/obtener/${userId}/${receiverId}`
          );
  
          // Verificar si la respuesta es JSON
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
              throw new Error("La respuesta no es JSON");
          }
  
          const data = await response.json();
          setMensajes(data);
      } catch (error) {
          console.error("Error cargando mensajes:", error.message);
      }
  };

    // Configurar Socket.io
    socket.on("mensaje_privado", (nuevoMensaje) => {
        setMensajes(prev => [...prev, nuevoMensaje]);
    });

    cargarUsuarios();

    return () => {
        socket.off("mensaje_privado");
    };
}, []);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/mensajes/obtener/${userId}/${receiverId}`
        );
        const data = await response.json();
        setMensajes(data);
      } catch (error) {
        console.error("Error cargando mensajes:", error);
      }
    };
    
    if (userId && receiverId) cargarHistorial();

    socket.on("connect", () => {
      socket.emit("unir_usuario", userId);
    });

    socket.on("mensaje_privado", (nuevoMensaje) => {
      setMensajes(prev => [...prev, nuevoMensaje]);
    });

    return () => {
      socket.off("mensaje_privado");
      socket.off("connect");
    };
  }, [userId, receiverId]);

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!mensaje.trim() || !receiverId) return;

    const mensajeData = {
        destinatario_id: receiverId,
        remitente_id: userId,
        contenido: mensaje
    };

    // Resetear campo primero para mejor experiencia
    setMensaje("");
    
    // Enviar por socket
    socket.emit("mensaje", mensajeData);
};

  useEffect(() => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTop = mensajesContainerRef.current.scrollHeight;
    }
  }, [mensajes]);


  return (
    <div className="h-full w-full flex bg-gray-900 text-white">
      {/* Sidebar de usuarios */}
      <aside className="w-64 bg-gray-800 p-4 shadow-lg">
        <Link to="/" className="text-blue-400 hover:underline mt-4">
          ← Volver al inicio
        </Link>
        <h2 className="text-xl font-bold mb-4 mt-9">Usuarios Conectados</h2>
        <ul className="space-y-2">
        {usuarios.map((usuario) => (
            <Link 
                key={usuario.id}
                to={`/chat/${usuario.id}`}
                className={`block p-2 rounded-lg ${
                    usuario.id === parseInt(receiverId) 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
            >
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                        usuario.conectado ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {usuario.nombre}
                </div>
            </Link>
        ))}
    </ul>
      </aside>

      {/* Área principal del chat */}
      <main className="relative flex-1 flex flex-col">
        <nav className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-4">
            <img src="/conexxo.png" className="h-24 w-24 object-contain" alt="logo" />
            <h1 className="text-3xl font-bold">ConneXXo</h1>
          </div>
        </nav>

        {/* Encabezado del chat */}
        <div className="p-4 bg-gray-700 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-4">
            <FaUser className="text-gray-500 w-8 h-8" />
            <span className="text-base font-bold">{nombreUser}</span>
          </div>
        </div>

        {/* Mensajes */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-4"
          ref={mensajesContainerRef}
        >
          {mensajes.map((msg, index) => (
    <div 
        key={index} // Usar index temporalmente
        className={`flex ${msg.remitente_id == userId ? "justify-end" : "justify-start"}`}
    >
        <div className={`p-3 rounded-lg max-w-md ${msg.remitente_id == userId ? "bg-blue-500" : "bg-gray-700"}`}>
            <p className="text-white">{msg.contenido}</p>
            <span className="text-xs text-gray-300">
                {new Date(msg.fecha).toLocaleTimeString()}
            </span>
        </div>
    </div>
))}
        </div>

        {/* Formulario de envío */}
        <form onSubmit={enviarMensaje} className="sticky bottom-0 p-4 bg-gray-800">
          <div className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg">
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 p-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="bg-yellow-400 text-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              Enviar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ChatIndividual;
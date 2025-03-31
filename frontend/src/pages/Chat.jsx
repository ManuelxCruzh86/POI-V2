import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaUser } from "react-icons/fa";
import clipIcon from '../assets/adjunto.png';
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); //Puerto del backend


function ChatIndividual({ userId, receiverId }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [cifrado, setCifrado] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [nombreUser, setNombreUser] = useState("");
  const videoRef = useRef(null);

  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: "Juan", estado: "", activo: 1 },
    { id: 2, nombre: "Ana", estado: "", activo: 0 },
    { id: 3, nombre: "Carlos", estado: "", activo: 0 },
    { id: 4, nombre: "María", estado: "", activo: 0 },
  ]);

  // obtencion de mensajes de el backend
  const obtenerMensajes = async () => {
    try {
        const response = await fetch(`http://localhost:3001/routes/mensajes/obtener/${userId}/${receiverId}`);
        if (!response.ok) throw new Error("Error al obtener los mensajes");

        const data = await response.json();
        setMensajes(data);
    } catch (error) {
        console.error("Error:", error);
    }
};


  useEffect(() => {
    obtenerMensajes();
  }, [receiverId]);

  // Escuchar mensajes en tiempo real
  useEffect(() => {
    socket.on("mensaje_recibido", (mensajeRecibido) => {
        setMensajes((prevMensajes) => [...prevMensajes, mensajeRecibido]);
    });

    return () => {
        socket.off("mensaje_recibido");
    };
}, []);


  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const nuevoMensaje = {
        contenido: mensaje,
        remitente_id: userId,
        destinatario_id: receiverId,
    };

    try {
        const response = await fetch("http://localhost:3001/routes/mensajes/enviar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoMensaje),
        });

        if (!response.ok) throw new Error("Error al enviar el mensaje");

        const mensajeGuardado = await response.json();
        setMensajes([...mensajes, mensajeGuardado]); 
        setMensaje(""); 
    } catch (error) {
        console.error("Error:", error);
    }
};


  useEffect(() => {
    const usuarioActivo = usuarios.find((usuario) => usuario.activo === 1);
    if (usuarioActivo) {
      setNombreUser(usuarioActivo.nombre);
    }
  }, [usuarios]);

  const manejarClick = (usuarioId) => {
    const usuariosActualizados = usuarios.map((usuario) => {
      return {
        ...usuario,
        activo: usuario.id === usuarioId ? 1 : 0,
      };
    });
    setUsuarios(usuariosActualizados);

    const usuarioActivo = usuarios.find((usuario) => usuario.id === usuarioId);
    setNombreUser(usuarioActivo ? usuarioActivo.nombre : "");
  };

  return (
    <div className="h-full w-full flex bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4 shadow-lg">
        <Link to="/" className="text-blue-400 hover:underline mt-4">
          ← Volver al inicio
        </Link>
        <h2 className="text-xl font-bold mb-4 mt-9">Usuarios Conectados</h2>
        <ul className="space-y-2">
          {usuarios.map((usuario) => (
            <li
              key={usuario.id}
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${
                1 === usuario.activo ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => manejarClick(usuario.id)}
            >
              <span>{usuario.estado}</span>
              <span>{usuario.nombre}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="relative flex-1 flex flex-col">
        <nav className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-4">
            <img src="/conexxo.png" className="h-24 w-24 object-contain" alt="logo" />
            <h1 className="text-3xl font-bold">ConneXXo</h1>
          </div>
        </nav>

        <div className="p-4 bg-gray-700 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-4">
            <FaUser className="text-gray-500 w-8 h-8" />
            <span className="text-base font-bold">{nombreUser}</span>
          </div>
        </div>

        <div className="flex-none p-6 overflow-y-auto">
          {mensajes.map((msg, index) => (
            <div key={index} className="mb-4">
              <div
                className={`p-4 rounded-lg max-w-md ${
                  msg.remitente_id === userId ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                <p>{msg.contenido}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={enviarMensaje} className="absolute inset-x-0 bottom-0 p-4 bg-gray-800 flex flex-col gap-2">
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
import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaUser, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { LiMensaje, UlMensajes } from './ui-components';

const socket = io("http://localhost:3001");

const ChatGrupal = () => {
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [miUsuario, setMiUsuario] = useState("");
  const [usuariosConectados, setUsuariosConectados] = useState([]);
  const mensajesContainerRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => console.log("Conectado al servidor"));
    
    socket.on('configuracion_inicial', (data) => {
      setMiUsuario(data.usuario);
      console.log('Usuario asignado:', data.usuario);
    });

    socket.on('chat_message', (data) => {
      setMensajes(prev => [...prev, {
        ...data,
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    });

    return () => {
      socket.off('connect');
      socket.off('configuracion_inicial');
      socket.off('chat_message');
    };
  }, []);

  useEffect(() => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTop = mensajesContainerRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (nuevoMensaje.trim() && miUsuario) {
      socket.emit('chat_message', {
        usuario: miUsuario,
        mensaje: nuevoMensaje
      });
      setNuevoMensaje("");
    }
  };

  return (
    <div className="h-full w-full flex bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4 shadow-lg flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaUsers />
            Usuarios Conectados
          </h2>
          <ul className="space-y-2">
            {usuariosConectados.map((usuario) => (
              <li key={usuario.id} className="flex items-center gap-2">
                <FaUser className="text-gray-400" />
                <span>{usuario.nombre}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/" className="text-blue-400 hover:underline mt-4">
          ← Volver al inicio
        </Link>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-gray-800 p-4 shadow-md">
          <h1 className="text-2xl font-bold">Chat Grupal</h1>
          <p className="text-sm text-gray-400">
            {miUsuario ? `Conectado como: ${miUsuario}` : "Conectando..."}
          </p>
        </header>

        <div
          ref={mensajesContainerRef}
          className="flex-1 p-4 overflow-y-auto space-y-4"
        >
          {mensajes.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.usuario === miUsuario ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md p-3 rounded-lg ${
                  msg.usuario === miUsuario
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <p className="font-semibold">{msg.usuario}</p>
                <p>{msg.mensaje}</p>
                <p className="text-xs text-gray-300 mt-1">{msg.hora}</p>
              </div>
            </div>
          ))}
        </div>

        <footer className="bg-gray-800 p-4">
          <form onSubmit={enviarMensaje} className="flex gap-2">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <FaPaperPlane />
              Enviar
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
};

export default ChatGrupal;
import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaUser, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { LiMensaje, UlMensajes } from './ui-components';

const socket = io("https://1822-200-68-188-0.ngrok-free.app/", {
  extraHeaders: {
    "ngrok-skip-browser-warning": "true",
  }
});

const ChatGrupal = () => {
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [miUsuario, setMiUsuario] = useState("");
  const [miUsuarioId, setMiUsuarioId] = useState("");
  const [usuariosConectados, setUsuariosConectados] = useState([]);
  const mensajesContainerRef = useRef(null);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    socket.on('connect', () => console.log("Conectado al servidor"));

    const user = localStorage.getItem("user");
    const userName = JSON.parse(user).nombre;
    const userId = JSON.parse(user).id;
    const grupoId = localStorage.getItem("tempGroupId");

    socket.on('configuracion_inicial', (data) => {
      setMiUsuario(userName);
      setMiUsuarioId(userId);
      console.log('Usuario asignado:', userName);
    });

     const fetchMensajes = async () => {
      try {
        const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/mensajes/conversacion-grupo?grupo_id=${grupoId}`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          }
        });
        if (response.ok) {
          const data = await response.json();
          const mensajesFormateados = data.mensajes.map(msg => ({
            usuario: msg.usuario_nombre,
            mensaje: msg.mensaje,
             usuario_id: msg.usuario_id,
            hora: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            esMio: msg.usuario_id === userId
          }));
          setMensajes(mensajesFormateados);
        }
      } catch (error) {
        console.error("Error al obtener mensajes:", error);
      }
    };

    fetchMensajes();

    socket.on('chat_message', (data) => {
      const esMensajePropio = data.usuario_id === userId;
      console.log("Mensaje recibido:", data);
console.log("Mensaje recibido:", data.usuario_id, userId);
      
      setMensajes(prev => [...prev, {
        ...data,
        usuario_id: data.usuario_id || userId, 
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        esMio:esMensajePropio
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

  const enviarMensaje = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;
    const grupoId = localStorage.getItem("tempGroupId");
    const userName = miUsuario; 

    if (nuevoMensaje.trim() && userId && grupoId) {
        try {
          
            socket.emit('chat_message', {
                usuario: user.nombre, 
                usuario_id: userId,   
                mensaje: nuevoMensaje,
                grupo_id: grupoId,
                created_at: new Date().toISOString() 
            });

            const response = await fetch('https://1822-200-68-188-0.ngrok-free.app/mensajes/enviar-grupo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({
                    grupo_id: grupoId,
                    usuario_id: userId,
                    mensaje: nuevoMensaje,
                })
            });

            if (!response.ok) {
                throw new Error('Error al guardar el mensaje');
            }

            setNuevoMensaje("");

        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert('Error al enviar el mensaje. Intenta nuevamente.');
        }
    }
};

  useEffect(() => {
    const idGrupo = localStorage.getItem("tempGroupId");
    
  
    const cargarUsuarios = async () => {
      try {
        const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/grupos/${idGrupo}/miembros`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          }
        });
        const data = await response.json();
        const dataMiembros = data.miembros;
        const otrosUsuarios = dataMiembros.filter(usuario => usuario.conectado === 1);
        setUsuarios(otrosUsuarios);
      } catch (error) {
        console.error("Error al cargar usuarios del grupo:", error);
      }
    };
    cargarUsuarios();
  }, []);

  return (
    <div className="h-full w-full flex bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4 shadow-lg flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaUsers />
            Usuarios Conectados
          </h2>
          <ul className="space-y-2">
            {usuarios.map((usuario) => (
              <li key={usuario.id} className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${
                  1 === usuario.activo ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                <span
                className={`w-3 h-3 rounded-full mr-2 ${
                  usuario.conectado ? "bg-green-400" : "bg-red-400"
                }`}
              ></span>
                <FaUser />
                <span>{usuario.nombre}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/home2" className="text-blue-400 hover:underline mt-4">
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
            <div key={index} className={`flex ${msg.esMio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-md p-3 rounded-lg ${msg.esMio ? "bg-blue-500 text-white" : "bg-gray-700 text-white"}`}>
                {!msg.esMio && <div className="font-semibold text-sm mb-1">{msg.usuario}</div>}
                <div>{msg.mensaje}</div>
                <div className={`text-xs mt-1 ${msg.esMio ? "text-blue-100" : "text-gray-300"}`}>
                  {msg.hora}
                </div>
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
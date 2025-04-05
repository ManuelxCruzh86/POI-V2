import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {LiMensaje, UlMensajes } from './ui-components';


const socket = io("http://localhost:3001"
/*   ,{auth: { token },
  withCredentials: true} */
);

function ChatGrupal() {

  const [isConnected, setIsConnected] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [miUsuario, setMiUsuario] = useState(''); // Nuevo estado para guardar tu usuario



  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    
    // Escuchar la configuración inicial del servidor
    socket.on('configuracion_inicial', (data) => {
      console.log('Nombre recibido del servidor:', data.usuario); // <-- Nuevo log
      setMiUsuario(data.usuario);    });

    socket.on('chat_message', (data) => {
        setMensajes(mensajes => [...mensajes, data]);
    });

    return () => {
        socket.off('connect');
        socket.off('chat_message');
        socket.off('configuracion_inicial');
    }
}, []);

const enviarMensaje = () => {
  if (!miUsuario || nuevoMensaje.trim() === '') return; // <-- Validación agregada
  
  socket.emit('chat_message', {
      usuario: miUsuario, // Usamos el usuario asignado por el servidor
      mensaje: nuevoMensaje
  });
  setNuevoMensaje('');
}

  return(
    <div className="App">
      <h2>{isConnected ? 'CONECTADO ' : 'NO CONECTADO'}</h2>
      <UlMensajes>
      {mensajes.map((mensaje, index) => (
        <LiMensaje key={index}>
                        <strong>{mensaje.usuario}:</strong> {mensaje.mensaje}
          </LiMensaje>))}
      </UlMensajes>
      <input type="text" onChange={e => setNuevoMensaje(e.target.value)}
      />
      
      <button onClick={enviarMensaje}>Enviar</button>
    </div>

  );
}

export default ChatGrupal;
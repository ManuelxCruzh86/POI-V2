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

  const[isConnected, setIsConnected]=useState();
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  
  useEffect(() => {

    socket.on('connect', ()=> setIsConnected(true));

    socket.on('chat_message', (data) => {
      setMensajes(mensajes => [...mensajes, data]);
    });

    return () => {
      socket.off('connect');
      socket.off('chat_message');
    }

  }, []);

  const enviarMensaje = () => {
    socket.emit('chat_message',{
      usuario: 'Usuario1', // Nombre hardcodeado 
      mensaje:nuevoMensaje
    });
    setNuevoMensaje(''); 

  }

  return(
    <div className="App">
      <h2>{isConnected ? 'CONECTADO' : 'NO CONECTADO'}</h2>
      <UlMensajes>
        {mensajes.map(mensaje => (
          <LiMensaje>{mensaje.usuario}: {mensaje.mensaje}</LiMensaje>
        ))}
      </UlMensajes>
      <input type="text" onChange={e => setNuevoMensaje(e.target.value)}
      />
      
      <button onClick={enviarMensaje}>Enviar</button>
    </div>

  );
}

export default ChatGrupal;
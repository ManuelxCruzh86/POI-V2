import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://1822-200-68-188-0.ngrok-free.app/", {
  auth: { token: localStorage.getItem("token") },
  headers: {
    "ngrok-skip-browser-warning": "true",
  }
})

export function useMembers(groupId) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/grupos/${groupId}/miembros`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          }
        });
        const data = await response.json();
        setMembers(data.miembros);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    cargarUsuarios();

    socket.on("usuarios_actualizados", (usuariosActualizados) => {
      setMembers(usuariosActualizados);
    });

    return () => {
      socket.off("usuarios_actualizados");
    };
  }, [groupId]);
    
  return [members, setMembers];
}
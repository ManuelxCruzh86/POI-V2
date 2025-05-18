import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  auth: { token: localStorage.getItem("token") }
})

export function useMembers(groupId) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await fetch(`http://localhost:3001/auth/grupos/${groupId}/miembros`);
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
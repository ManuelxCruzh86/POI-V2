import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://1822-200-68-188-0.ngrok-free.app/", {
  auth: { token: localStorage.getItem("token") },
  extraHeaders: {
    "ngrok-skip-browser-warning": "true",
  }
});

export default function Usuarios() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const idGrupo = localStorage.getItem('tempGroupId');
    const cargarUsuarios = async () => {
      try {
        const response = await fetch(`https://1822-200-68-188-0.ngrok-free.app/auth/grupos/${idGrupo}/miembros`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          }
        });
        const data = await response.json();
        setUsers(data.miembros);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    cargarUsuarios();

    socket.on("usuarios_actualizados", (usuariosActualizados) => {
      setUsers(usuariosActualizados);
    });

    return () => {
      socket.off("usuarios_actualizados");
    };
  }, []);

  return (
    <div className="h-full w-full bg-gray-900 text-white flex flex-col items-center">
      <nav className="w-full bg-gray-800 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <img src="/conexxo.png" className="h-24 w-24 object-contain" alt="Logo" />
          <h1 className="text-3xl font-bold">ConneXXo</h1>
        </div>
        <Link to="/home2" className="text-yellow-400 hover:text-yellow-300">← Volver al Inicio</Link>
      </nav>

      <main className="grow w-full max-w-4xl flex flex-col py-6">
        <h2 className="text-4xl font-bold mb-6 text-center">Estado de Usuarios</h2>
        <div className="flex-1 overflow-y-auto w-full space-y-4 p-4 bg-gray-800 rounded-lg shadow-lg">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-center space-x-4">
                <Link
                  to={`/chat/${user.id}`}
                  className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.nombre}</p>
                    <p className="text-sm text-gray-300">{user.email}</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.conectado
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {user.conectado ? "Conectado" : "Desconectado"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react"; 
import { FaPaperPlane, FaUser, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom"; // Asegúrate de importar Link

const ChatGrupal = () => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [usuariosConectados, setUsuariosConectados] = useState([
    { id: 1, nombre: "Juan" },
    { id: 2, nombre: "Ana" },
    { id: 3, nombre: "Carlos" },
  ]);
  const mensajesContainerRef = useRef(null);

  useEffect(() => {
    const mensajesIniciales = [
      { id: 1, usuario: "Juan", texto: "¡Hola a todos!", hora: "10:00 AM" },
      { id: 2, usuario: "Ana", texto: "¿Cómo están?", hora: "10:01 AM" },
    ];
    setMensajes(mensajesIniciales);
  }, []);

  useEffect(() => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTop = mensajesContainerRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (mensaje.trim()) {
      const nuevoMensaje = {
        id: mensajes.length + 1,
        usuario: "Tú", 
        texto: mensaje,
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMensajes([...mensajes, nuevoMensaje]);
      setMensaje("");
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
          <p className="text-sm text-gray-400">Comunicación en tiempo real con el grupo.</p>
        </header>

        <div
          ref={mensajesContainerRef}
          className="flex-1 p-4 overflow-y-auto space-y-4"
        >
          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.usuario === "Tú" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md p-3 rounded-lg ${
                  msg.usuario === "Tú"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <p className="font-semibold">{msg.usuario}</p>
                <p>{msg.texto}</p>
                <p className="text-xs text-gray-300 mt-1">{msg.hora}</p>
              </div>
            </div>
          ))}
        </div>

        <footer className="bg-gray-800 p-4">
          <form onSubmit={enviarMensaje} className="flex gap-2">
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
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

import React, { useState, useRef, useEffect } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaUser,
} from "react-icons/fa";
import clipIcon from "../assets/adjunto.png";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";


import { useMembers } from "../hooks/useMembers";
import { use2PeerCall } from "../hooks/use2PeerCall";

function ChatIndividual() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [cifrado, setCifrado] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [nombreUser, setNombreUser] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const mensajesEndRef = useRef(null);
  const videoRef = useRef(null);

  const groupId = localStorage.getItem("tempGroupId");
  const idLogged = Number(localStorage.getItem("userId"));
  const [usuarios, setUsuarios] = useMembers(groupId);

  const socket = io("http://localhost:3001", {
    auth: { token: localStorage.getItem("token") },
  });

  const { localVideoRef, partnerStream } = use2PeerCall(groupId, isOpen, isMicOn, isVideoOn);

  const cifrarMensaje = (texto, desplazamiento = 3) => {
    return texto.replace(/[a-zA-Z]/g, (char) => {
      const base = char === char.toLowerCase() ? 97 : 65;
      return String.fromCharCode(((char.charCodeAt(0) - base + desplazamiento) % 26) + base);
    });
  };

  const descifrarMensaje = (texto, desplazamiento = 3) => {
    return texto.replace(/[a-zA-Z]/g, (char) => {
      const base = char === char.toLowerCase() ? 97 : 65;
      return String.fromCharCode(((char.charCodeAt(0) - base - desplazamiento + 26) % 26) + base);
    });
  };

  const scrollToBottom = () => {
    if (mensajesEndRef.current) {
      mensajesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToBottom, [mensajes]);

  useEffect(() => {
    if (isOpen && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: isVideoOn, audio: isMicOn })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((error) => console.error("Error de cámara/micrófono:", error));
    }
  }, [isMicOn, isVideoOn, isOpen]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await fetch(`http://localhost:3001/auth/grupos/${groupId}/miembros`);
        const data = await response.json();
        const otrosUsuarios = data.miembros.filter(u => u.id !== idLogged);
        setUsuarios(otrosUsuarios);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };
    cargarUsuarios();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedUserId) manejarClick(selectedUserId);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    socket.on("usuarios_actualizados", setUsuarios);
    return () => socket.off("usuarios_actualizados");
  }, []);

  useEffect(() => {
    socket.on("nuevo_mensaje", (mensajeRecibido) => {
      if (mensajeRecibido.remitente_id === selectedUserId) {
        const contenidoMostrado = mensajeRecibido.es_cifrado
          ? descifrarMensaje(mensajeRecibido.contenido)
          : mensajeRecibido.contenido;

        const nuevoMensaje = {
          id: mensajes.length + 1,
          contenido: contenidoMostrado,
          archivo: ["archivo", "ubicación"].includes(mensajeRecibido.tipo)
            ? mensajeRecibido.archivo
            : null,
          tipo: mensajeRecibido.tipo,
        };
        setMensajes((prev) => [...prev, nuevoMensaje]);
      }
    });
    return () => socket.off("nuevo_mensaje");
  }, [selectedUserId, mensajes]);

  const manejarClick = async (usuarioId) => {
    setSelectedUserId(usuarioId);
    const usuario = usuarios.find((u) => u.id === usuarioId);
    setNombreUser(usuario?.nombre || "");

    setUsuarios(usuarios.map((u) => ({ ...u, activo: u.id === usuarioId ? 1 : 0 })));

    try {
      const res = await fetch(`http://localhost:3001/mensajes/conversacion?usuario1=${idLogged}&usuario2=${usuarioId}&grupoId=${groupId}`);
      const data = await res.json();
      if (data.success) {
        const mensajesDescifrados = data.mensajes.map(msg => ({
          ...msg,
          contenido: msg.es_cifrado ? descifrarMensaje(msg.contenido) : msg.contenido,
          archivo: msg.tipo === "archivo" ? `/uploads/${msg.contenido}` : (msg.tipo === "ubicación" ? msg.contenido : null),
        }));
        setMensajes(mensajesDescifrados);
      }
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
    }
  };

  const compartirUbicacion = () => {
    if (!selectedUserId || !navigator.geolocation) {
      alert("Ubicación no disponible");
      return;
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const link = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
      const payload = {
        remitente_id: idLogged,
        destinatario_id: selectedUserId,
        contenido: link,
        es_cifrado: 0,
        tipo: "ubicación",
        grupo_id: groupId,
      };

      try {
        const res = await fetch("http://localhost:3001/mensajes/privado", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (result.success) {
          setMensajes([...mensajes, {
            id: mensajes.length + 1,
            contenido: link,
            archivo: link,
            tipo: "ubicación",
          }]);
        }
      } catch (error) {
        console.error("Error al enviar ubicación:", error);
      }
    }, (error) => alert("Error obteniendo ubicación: " + error.message));
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    if (archivo) {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("remitente_id", idLogged);
      formData.append("destinatario_id", selectedUserId);
      formData.append("grupo_id", groupId);
      formData.append("es_cifrado", cifrado ? 1 : 0);

      try {
        const res = await fetch("http://localhost:3001/mensajes/archivo", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        if (result.success) {
          setMensajes([...mensajes, {
            id: mensajes.length + 1,
            contenido: archivo.name,
            archivo: `/uploads/${result.archivo}`,
            tipo: "archivo",
          }]);
          setArchivo(null);
          setMensaje("");
          return;
        }
      } catch (error) {
        console.error("Error al enviar archivo:", error);
      }
    }

    if (!mensaje.trim()) return;

    const contenidoFinal = cifrado ? cifrarMensaje(mensaje) : mensaje;
    const payload = {
      remitente_id: idLogged,
      destinatario_id: selectedUserId,
      contenido: contenidoFinal,
      es_cifrado: cifrado ? 1 : 0,
      tipo: "texto",
      grupo_id: groupId,
    };

    try {
      const res = await fetch("http://localhost:3001/mensajes/privado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        setMensajes([...mensajes, {
          id: mensajes.length + 1,
          contenido: mensaje,
          tipo: "texto",
        }]);
        setMensaje("");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
  <div className="h-full w-full flex bg-gray-900 text-white">
    {/* Sidebar */}
    <aside className="w-64 bg-gray-800 p-4 shadow-lg">
      <Link to="/home2" className="text-blue-400 hover:underline mt-4">
        ← Volver al inicio
      </Link>
      <h2 className="text-xl font-bold mb-4 mt-9">Usuarios Conectados</h2>
      <ul className="space-y-2">
        {usuarios.map((usuario) => {
          if (usuario.id === idLogged) return null;
          return (
            <li
              key={usuario.id}
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${
                usuario.activo === 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => manejarClick(usuario.id)}
            >
              <span
                className={`w-3 h-3 rounded-full mr-2 ${
                  usuario.conectado ? "bg-green-400" : "bg-red-400"
                }`}
              ></span>
              <span>{usuario.nombre}</span>
            </li>
          );
        })}
      </ul>
    </aside>

    {/* Main Content */}
    <main className="relative flex-1 flex flex-col">
      {/* Header */}
      <nav className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <img
            src="/conexxo.png"
            className="h-24 w-24 object-contain"
            alt="logo"
          />
          <h1 className="text-3xl font-bold">ConneXXo</h1>
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto mb-40">
        {!selectedUserId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-2xl mb-4">👋</div>
            <div className="text-xl font-semibold">Selecciona un contacto</div>
            <p className="text-center max-w-md mt-2">
              Elige a una persona de la lista para iniciar una conversación
            </p>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-2xl mb-4">💬</div>
            <div className="text-xl font-semibold">No hay mensajes aún</div>
            <p className="text-center max-w-md mt-2">
              Envía un mensaje para iniciar la conversación con {nombreUser}
            </p>
          </div>
        ) : (
          mensajes.map((msg) => (
            <div key={msg.id} className="mb-4">
              <div className="bg-gray-700 p-4 rounded-lg max-w-md">
                <div className="text-xs text-gray-400 mb-1">
                  <span className="font-semibold">
                    {msg.remitente_id === parseInt(localStorage.getItem("userId"))
                      ? "Tú"
                      : nombreUser}
                  </span>{" "}
                  • {new Date().toLocaleString()}
                </div>
                <p>{cifrado ? "[Mensaje Cifrado]" : msg.contenido}</p>

                {msg.archivo && (
                  <div className="mt-2">
                    {msg.tipo === "ubicación" ? (
                      <a
                        href={msg.archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 underline"
                      >
                        Ver ubicación en Google Maps 🗺️
                      </a>
                    ) : /\.(png|jpg|jpeg|gif)$/i.test(msg.archivo) ? (
                      <img
                        src={msg.archivo}
                        alt="Archivo"
                        className="max-w-full h-auto rounded-lg"
                      />
                    ) : (
                      <a
                        href={`http://localhost:3001/mensajes/descargar/${msg.archivo.split("/").pop()}`}
                        className="text-blue-400 underline"
                      >
                        Descargar archivo: {msg.contenido}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={enviarMensaje}
        className={`absolute inset-x-0 bottom-0 p-4 bg-gray-800 flex flex-col gap-2 ${
          !selectedUserId ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder={
              !selectedUserId
                ? "Selecciona un contacto para chatear"
                : "Escribe un mensaje..."
            }
            className="flex-1 p-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            disabled={!selectedUserId}
          />
          <label
            className={`cursor-pointer ${
              !selectedUserId ? "text-gray-500" : "text-gray-400 hover:text-white"
            }`}
          >
            <input
              type="file"
              name="archivo"
              onChange={(e) => {
                const file = e.target.files[0];
                setArchivo(file);
                console.log("Archivo seleccionado:", file);
              }}
            />
            <img
              src={clipIcon}
              alt="Adjuntar archivo"
              className="w-6 h-6"
              style={{ opacity: !selectedUserId ? 0.5 : 1 }}
            />
          </label>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !selectedUserId
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-yellow-400 text-gray-100 hover:bg-yellow-500"
            }`}
            disabled={!selectedUserId}
          >
            Enviar
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={compartirUbicacion}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !selectedUserId
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={!selectedUserId}
          >
            Compartir Ubicación 📌
          </button>
          <button
            type="button"
            onClick={() => setCifrado(!cifrado)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !selectedUserId
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            disabled={!selectedUserId}
          >
            {cifrado ? "Desactivar Cifrado 🔓" : "Activar Cifrado 🔐"}
          </button>
          <button
            type="button"
            onClick={openModal}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !selectedUserId
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            disabled={!selectedUserId}
          >
            Empezar Videollamada 📹
          </button>
        </div>
      </form>
    </main>

    {/* Modal Videollamada */}
    {isOpen && (
      <div
        className="relative z-10"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-gray-900/75 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-black text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-gray-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-white mb-4">
                      Videollamada Privada
                    </h2>

                    <div className="bg-gray-700 rounded-lg overflow-hidden mb-4">
                      {isVideoOn ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-600 flex items-center justify-center">
                          <p className="text-gray-400 font-bold">
                            Cámara apagada
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-700 rounded-lg overflow-hidden mb-4">
                      <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                        {/* Aquí iría el video del otro participante */}
                      </div>
                    </div>

                    {/* Botones o controles adicionales del modal pueden ir aquí */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

}

export default ChatIndividual;

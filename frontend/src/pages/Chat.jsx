import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaUser } from "react-icons/fa";
import clipIcon from '../assets/adjunto.png';
import { Link } from "react-router-dom";
import { io } from "socket.io-client";


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
  const [showPreview, setShowPreview] = useState(true);
  const [nombreUser, setNombreUser] = useState("");
  const videoRef = useRef(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const mensajesEndRef = useRef(null);
  const [usuarios, setUsuarios] = useState([]);

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

  useEffect(() => {
    if (showPreview) {
      navigator.mediaDevices
        .getUserMedia({ video: isVideoOn, audio: isMicOn })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Error al acceder a los dispositivos multimedia:", error);
        });
    }
  }, [isMicOn, isVideoOn, showPreview]);



  const socket = io("http://localhost:3001", {
  auth: { token: localStorage.getItem("token") }
});

useEffect(() => {
  const interval = setInterval(() => {
    if (selectedUserId) manejarClick(selectedUserId);
  }, 5000); 
  return () => clearInterval(interval);
}, [selectedUserId]);


useEffect(() => {
  socket.on("usuarios_actualizados", (usuariosActualizados) => {
    setUsuarios(usuariosActualizados);
  });

  return () => {
    socket.off("usuarios_actualizados");
  };
}, []);

  useEffect(() => {
  const idGrupo = localStorage.getItem("tempGroupId");
  const userId = localStorage.getItem("userId");

  const cargarUsuarios = async () => {
    try {
      const response = await fetch(`http://localhost:3001/auth/grupos/${idGrupo}/miembros`);
      const data = await response.json();
      const dataMiembros = data.miembros;
      const otrosUsuarios = dataMiembros.filter(usuario => usuario.id !== Number(userId));
      setUsuarios(otrosUsuarios);
    } catch (error) {
      console.error("Error al cargar usuarios del grupo:", error);
    }
  };
  cargarUsuarios();
}, []);



 useEffect(() => {
    socket.on("nuevo_mensaje", (mensajeRecibido) => {
      if (mensajeRecibido.remitente_id === selectedUserId) {
        const contenidoMostrado = mensajeRecibido.es_cifrado ? descifrarMensaje(mensajeRecibido.contenido) : mensajeRecibido.contenido;
        setMensajes((prev) => [...prev, {
          id: prev.length + 1,
          contenido: contenidoMostrado,
          archivo: null,
        }]);
      }
    });

    return () => {
      socket.off("nuevo_mensaje");
    };
  }, [selectedUserId]);


useEffect(() => {
  scrollToBottom();
}, [mensajes]);

  const scrollToBottom = () => {
  if (mensajesEndRef.current) {
    mensajesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
};


   const openModal = () => {
     setIsOpen(true);
     setShowPreview(true);
   };
 

   const closeModal = () => {
     setIsOpen(false);
     setShowPreview(false); 
   };
  
   const manejarClick = async (usuarioId) => {
  setSelectedUserId(usuarioId);
  const usuario = usuarios.find((u) => u.id === usuarioId);
  setNombreUser(usuario?.nombre || "");

  const remitenteId = localStorage.getItem("userId");
  const grupoIdRef = localStorage.getItem("tempGroupId");

   try {
      const res = await fetch(`http://localhost:3001/mensajes/conversacion?usuario1=${remitenteId}&usuario2=${usuarioId}&grupoId=${grupoIdRef}`);
      const data = await res.json();
      if (data.success) {
        const mensajesDescifrados = data.mensajes.map(msg => ({
          ...msg,
          contenido: msg.es_cifrado ? descifrarMensaje(msg.contenido) : msg.contenido
        }));
        setMensajes(mensajesDescifrados);
      }
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
    }
  };

  const compartirUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setMensajes([...mensajes, { id: mensajes.length + 1, contenido: "Ubicación compartida", archivo: link }]);
      });
    } else {
      alert("La geolocalización no está soportada en este navegador.");
    }
  };



  const enviarMensaje = async (e) => {
    e.preventDefault();
    const remitenteId = localStorage.getItem("userId");
    const grupoIdRef = localStorage.getItem("tempGroupId");

    if ((!mensaje || mensaje.trim() === "") || !selectedUserId) return;

    const contenidoFinal = cifrado ? cifrarMensaje(mensaje) : mensaje;

    const payload = {
      remitente_id: remitenteId,
      destinatario_id: selectedUserId,
      contenido: contenidoFinal,
      es_cifrado: cifrado ? 1 : 0,
      tipo: "texto",
      grupo_id: grupoIdRef
    };

    try {
      const response = await fetch("http://localhost:3001/mensajes/privado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        const nuevoMensaje = {
          id: mensajes.length + 1,
          contenido: mensaje,
          archivo: null,
        };
        setMensajes([...mensajes, nuevoMensaje]);
        setMensaje("");
      } else {
        alert("Error al enviar mensaje");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };












  return (
    <div className="h-full w-full flex bg-gray-900 text-white">
        <div className="h-full w-full flex bg-gray-900 text-white">
      
        <aside className="w-64 bg-gray-800 p-4 shadow-lg">
          <Link to="/home2" className="text-blue-400 hover:underline mt-4">
            ← Volver al inicio
          </Link>
          <h2 className="text-xl font-bold mb-4 mt-9">Usuarios Conectados</h2>
            <ul className="space-y-2">
            {usuarios.map((usuario) => (
              <li
                key={usuario.id}
                className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${
                  1 === usuario.activo ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
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
                  <span className="font-semibold">{msg.remitente_id === parseInt(localStorage.getItem("userId")) ? 'Tú' : nombreUser}</span>
                  {' • '}{new Date().toLocaleString()}
                </div>
                <p>{cifrado ? "[Mensaje Cifrado]" : msg.contenido}</p>

                {msg.archivo && (
                  typeof msg.archivo === "string" ? (
                    msg.archivo.endsWith(".png") || msg.archivo.endsWith(".jpg") || msg.archivo.endsWith(".jpeg") ? (
                      <img src={msg.archivo} alt="Archivo adjunto" className="max-w-full h-auto" />
                    ) : (
                      <a href={msg.archivo} target="_blank" rel="noopener noreferrer" className="text-blue-400">Ver archivo</a>
                    )
                  ) : (
                    <p>Archivo adjunto</p>
                  )
                )}
              </div>
            </div>
            ))
          )}
        </div>

        <div ref={mensajesEndRef} />


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
              placeholder={!selectedUserId ? "Selecciona un contacto para chatear" : "Escribe un mensaje..."}
              className="flex-1 p-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={!selectedUserId}
            />
            <label className={`cursor-pointer ${!selectedUserId ? "text-gray-500" : "text-gray-400 hover:text-white"}`}>
              <input
                type="file"
                onChange={(e) => setArchivo(e.target.files[0])} 
                className="hidden"
                disabled={!selectedUserId}
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

      
      
        {isOpen && (
        <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-gray-900/75 transition-opacity" aria-hidden="true"></div>
              <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  
                  <div class="relative transform overflow-hidden rounded-lg bg-black text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div class="bg-gray-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      
                      <div class="sm:flex sm:items-start">
        
                      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6">
                          <h2 className="text-2xl font-semibold text-white mb-4">Videollamada Privada</h2>
                              <div className="bg-gray-700 rounded-lg overflow-hidden mb-4">
                                    {isVideoOn ? (
                                      <video ref={videoRef} autoPlay muted className="w-full h-48 object-cover" />
                                    ) : (
                                      <div className="w-full h-48 bg-gray-600 flex items-center justify-center">
                                        <p className="text-gray-400 font-bold">Cámara apagada</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="bg-gray-700 rounded-lg overflow-hidden mb-4">
                                      <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <p className="text-white font-bold">Video de Juan</p>
                                      </div>
                                  </div>

                                  <div className="flex justify-center gap-4 mb-6">
                                    <button
                                      onClick={() => setIsMicOn(!isMicOn)}
                                      className={`p-3 rounded-full text-white ${
                                        isMicOn ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                      }`}
                                    >
                                      {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                                    </button>
                                    <button
                                      onClick={() => setIsVideoOn(!isVideoOn)}
                                      className={`p-3 rounded-full text-white ${
                                        isVideoOn ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                      }`}
                                    >
                                      {isVideoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
                                    </button>

                                    <button
                                        className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
                                        onClick={closeModal}
                                          >
                                        <FaPhoneSlash size={24} />
                                    </button>
                                  </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </div>
        )}

        </div>

</div>
  );
}

export default ChatIndividual;
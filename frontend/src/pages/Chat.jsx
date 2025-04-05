import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaUser } from "react-icons/fa";
import clipIcon from '../assets/adjunto.png';
import { Link } from "react-router-dom";

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


  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: "Juan", estado: "", activo: 1 },
    { id: 2, nombre: "Ana", estado: "", activo: 0 },
    { id: 3, nombre: "Carlos", estado: "", activo: 0 },
    { id: 4, nombre: "María", estado: "", activo: 0 },
  ]);

  useEffect(() => {
    const usuarioActivo = usuarios.find((usuario) => usuario.activo === 1);
    if (usuarioActivo) {
      setNombreUser(usuarioActivo.nombre);
    }
  }, [usuarios]);


  const enviarMensaje = (e) => {
    e.preventDefault();
    if (mensaje.trim() || archivo) {
      const archivoUrl = archivo ? URL.createObjectURL(archivo) : null;
      setMensajes([...mensajes, { id: mensajes.length + 1, texto: mensaje, archivo: archivoUrl }]);
      setMensaje("");
      setArchivo(null);
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
  
   const manejarClick = (usuarioId) => {
    const usuariosActualizados = usuarios.map((usuario) => {
      return {
        ...usuario,
        activo: usuario.id === usuarioId ? 1 : 0, 
      };
    });
    setUsuarios(usuariosActualizados);

    const usuarioActivo = usuarios.find((usuario) => usuario.id === usuarioId);
    setNombreUser(usuarioActivo ? usuarioActivo.nombre : "");
  };

  const compartirUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setMensajes([...mensajes, { id: mensajes.length + 1, texto: "Ubicación compartida", archivo: link }]);
      });
    } else {
      alert("La geolocalización no está soportada en este navegador.");
    }
  };


  return (
    
    <div className="h-full w-full flex bg-gray-900 text-white">
      
        <aside className="w-64 bg-gray-800 p-4 shadow-lg">
          <Link to="/" className="text-blue-400 hover:underline mt-4">
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
                <span>{usuario.estado}</span>
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

          <div className="flex-none p-6 overflow-y-auto">
            {mensajes.map((msg) => (
              <div key={msg.id} className="mb-4">
                <div className="bg-gray-700 p-4 rounded-lg max-w-md">
                  <p>{cifrado ? "[Mensaje Cifrado]" : msg.texto}</p>

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
            ))}
          </div>


          <form onSubmit={enviarMensaje} className="absolute inset-x-0 bottom-0 p-4 bg-gray-800 flex flex-col gap-2">
                 
                 <div className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg">
                    <input
                      type="text"
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 p-2 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <label className="cursor-pointer text-gray-400 hover:text-white ">
                      <input
                         type="file"
                         onChange={(e) => setArchivo(e.target.files[0])} 
                         className="hidden"
                      />
                      <img src={clipIcon} alt="Adjuntar archivo" className="w-6 h-6" />
                    </label>
                    <button
                      type="submit"
                      className="bg-yellow-400 text-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
                       >
                      Enviar
                    </button>
                  </div>                 

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={compartirUbicacion}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                      Compartir Ubicación 📌
                    </button>
                    <button
                      type="button"
                      onClick={() => setCifrado(!cifrado)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                    >
                      {cifrado ? "Desactivar Cifrado 🔓" : "Activar Cifrado 🔐"}
                    </button>
                    <button
                      type="button"
                      onClick={openModal}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
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


  );
}

export default ChatIndividual;
import React, { useState } from "react"; 
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 

const VideoCall = () => {
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState("Conectando...");
  const [usuariosConectados, setUsuariosConectados] = useState([
    { id: 1, nombre: "Juan", video: true },
    { id: 2, nombre: "Ana", video: false },
  ]);

  const unirseAVideollamada = () => {
    const nuevoUsuario = {
      id: usuariosConectados.length + 1,
      nombre: `Usuario ${usuariosConectados.length + 1}`,
      video: true,
    };
    setUsuariosConectados([...usuariosConectados, nuevoUsuario]);
  };

  const finalizarLlamada = () => {
    setCallStatus("Finalizado");
    navigate("/"); // Redirigir al inicio
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-900">
      <div className="w-full h-full max-w-6xl bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="bg-gray-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Videollamada en Curso</h2>
          <p className={`text-sm ${callStatus === "Conectado" ? "text-green-400" : "text-yellow-400"}`}>
            {callStatus}
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg shadow-md flex flex-col items-center justify-center p-4">
            {isVideoOn ? (
              <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-white font-bold">Tu Video</p>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400 font-bold">Cámara apagada</p>
              </div>
            )}
            <p className="mt-2 text-white font-semibold">Tú</p>
          </div>

          {usuariosConectados.map((usuario) => (
            <div
              key={usuario.id}
              className="bg-gray-900 rounded-lg shadow-md flex flex-col items-center justify-center p-4"
            >
              {usuario.video ? (
                <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-white font-bold">Video de {usuario.nombre}</p>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 font-bold">Cámara apagada</p>
                </div>
              )}
              <p className="mt-2 text-white font-semibold">{usuario.nombre}</p>
            </div>
          ))}
        </div>

        <footer className="bg-gray-700 p-4 flex justify-center gap-6">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3 rounded-full text-white ${
              isMicOn ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isMicOn ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
          </button>
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-full text-white ${
              isVideoOn ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isVideoOn ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
          </button>
          <button
            onClick={unirseAVideollamada}
            className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
            <FaUserPlus size={24} />
          </button>
          <button
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
            onClick={finalizarLlamada} // redirigir
          >
            <FaPhoneSlash size={24} />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default VideoCall;

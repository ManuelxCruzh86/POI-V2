import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaLink, FaUserPlus, FaPhoneSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const VideoCallPreview = () => {
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState("Preparándose...");
  const [showPreview, setShowPreview] = useState(true);
  const [roomLink, setRoomLink] = useState("");
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

  const generateRoomLink = () => {
    const link = `https://tu-app.com/videollamada/${Math.random().toString(36).substring(7)}`;
    setRoomLink(link);
  };

  const joinCall = () => {
    setShowPreview(false);
    setCallStatus("Conectando...");
    navigate("/Videollamada2");
  };

  return (
    <div className="h-full w-full bg-gray-900">
      {/* Navbar */}
      <nav className="w-full bg-gray-800 text-white py-4 px-6 fixed top-0 left-0 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <img src="/conexxo.png" className="h-24 w-24 object-contain" alt="Logo" />
          <h1 className="text-3xl font-bold">ConneXXo</h1>
        </div>
        <Link to="/" className="text-yellow-400 hover:text-yellow-300">← Volver al Inicio</Link>
      </nav>

      <div className="h-full w-full flex items-center justify-center pt-24">
        {showPreview ? (
          <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Preparar Videollamada</h2>
            <div className="bg-gray-700 rounded-lg overflow-hidden mb-4">
              {isVideoOn ? (
                <video ref={videoRef} autoPlay muted className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-600 flex items-center justify-center">
                  <p className="text-gray-400 font-bold">Cámara apagada</p>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mb-6">
              <button onClick={() => setIsMicOn(!isMicOn)} className={`p-3 rounded-full text-white ${isMicOn ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </button>
              <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-3 rounded-full text-white ${isVideoOn ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>
                {isVideoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={generateRoomLink} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                <FaLink size={16} />
                {roomLink ? "Copiar Enlace" : "Generar Enlace"}
              </button>
              {roomLink && (
                <input type="text" value={roomLink} readOnly className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg" onClick={(e) => e.target.select()} />
              )}
              <button onClick={joinCall} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                <FaUserPlus size={16} />
                Unirse a la Videollamada
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <p>Videollamada en curso...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallPreview;

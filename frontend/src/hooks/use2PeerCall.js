import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Peer from "simple-peer/simplepeer.min.js";

export function use2PeerCall(roomID, startCall, isMicOn, isVideoOn) {
  const [partnerStream, setPartnerStream] = useState(null);
  const localVideoRef = useRef();
  const socketRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    if (!startCall) return;
    socketRef.current = io("http://localhost:3001");
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // muestra tu video
        localVideoRef.current.srcObject = stream;

        // únete y espera “ready”
        socketRef.current.emit("join_room", roomID);
        socketRef.current.on("ready", () => {
          // si no existe peer, eres iniciador
          const peer = new Peer({ initiator: true, trickle: false, stream });
          peer.on("signal", (data) => {
            socketRef.current.emit("signal", { roomID, data });
          });
          peer.on("stream", (remote) => setPartnerStream(remote));
          peerRef.current = peer;
        });

        // si ya hay señal entrante (oferta o respuesta)
        socketRef.current.on("signal", (data) => {
          if (!peerRef.current) {
            // eres el segundo, no iniciador
            const peer = new Peer({ initiator: false, trickle: false, stream });
            peer.on("signal", (data) => {
              socketRef.current.emit("signal", { roomID, data });
            });
            peer.on("stream", (remote) => setPartnerStream(remote));
            peerRef.current = peer;
          }
          peerRef.current.signal(data);
        });

        socketRef.current.on("peer_disconnected", () => {
          setPartnerStream(null);
          peerRef.current?.destroy();
          peerRef.current = null;
        });
      });

    return () => {
      socketRef.current.disconnect();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [startCall, roomID, isMicOn, isVideoOn]);

  return { localVideoRef, partnerStream };
}

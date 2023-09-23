import React, { useCallback, useState, useEffect } from 'react';
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";

function LobbyScreen() {
  const [room, setRoom] = useState("");
  const [stream, setStream] = useState();
  const socket = useSocket();
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ],
      },
    ],
  });

  useEffect(() => {
    // Listen for the "start-streaming" event from the backend
    socket.on("start-streaming", () => {
      console.log("Received start-streaming event from the backend. Starting streaming...");
      startStreaming(); // Start streaming when the event is received
    });

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off("start-streaming");
    };
  }, [socket]);

  const startStreaming = async () => {
    try {
      const myStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      // Add the tracks to the peer connection
      myStream.getTracks().forEach((track) => {
        peer.addTrack(track, myStream);
      });

      // Create an offer
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // Send the offer to the server
      socket.emit('offer', peer.localDescription);

      // Set the stream in state
      setStream(myStream);

    } catch (error) {
      // Handle any errors that might occur when getting the user's media
      console.error("Error getting user media:", error);
    }
  };

  const handleStartStreaming = useCallback(async (e) => {
    e.preventDefault();

    // Emit the "start-streaming" event to trigger streaming in the backend
    socket.emit("start-streaming");
  }, [socket]);

  return (
    <div>
      <h1>Lobby Screen</h1>

      <form onSubmit={handleStartStreaming}>
        <label htmlFor="room">Room No:</label>
        <input type="text" id='room' value={room} onChange={(e) => setRoom(e.target.value)} />
        <button>Start Streaming</button>
        {stream && (
          <>
            <h1>My Stream is ready</h1>
            <ReactPlayer height={300} width={300} playing muted url={stream} />
          </>
        )}
      </form>
    </div>
  );
}

export default LobbyScreen;

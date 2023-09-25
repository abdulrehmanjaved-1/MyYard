import React, { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";

function LobbyScreen() {
  const [room, setRoom] = useState("");
  const [stream, setStream] = useState();
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [streamKeys, setStreamKeys] = useState({}); // Initialize as an empty object
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
      console.log(
        "Received start-streaming event from the backend. Starting streaming..."
      );
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
        video: true,
      });

      // Add the tracks to the peer connection
      myStream.getTracks().forEach((track) => {
        peer.addTrack(track, myStream);
      });

      // Create an offer
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // Send the offer to the server
      socket.emit("offer", peer.localDescription);

      // Set the stream in state
      setStream(myStream);
    } catch (error) {
      // Handle any errors that might occur when getting the user's media
      console.error("Error getting user media:", error);
    }
  };

  const handleStartStreaming = useCallback(
    async (e) => {
      e.preventDefault();
      console.log("hi",streamKeys)
      // Emit the "start-streaming" event to trigger streaming in the backend
      socket.emit("start-streaming", {
        platforms: selectedPlatforms,
        streamKeys: streamKeys,
      });
    },
    [socket, selectedPlatforms, streamKeys]
  );

  // Function to update the stream keys when the user selects a platform
  const handleStreamKeyChange = (platform, key) => {
    setStreamKeys((prevStreamKeys) => ({
      ...prevStreamKeys,
      [platform]: key,
    }));
  };

  return (
    <div>
      <h1>Lobby Screen</h1>

      <form onSubmit={handleStartStreaming}>
        <h3>Select platforms to stream to:</h3>
        <label>
          <input
            type="checkbox"
            value="youtube"
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedPlatforms((prevPlatforms) => [
                  ...prevPlatforms,
                  "youtube",
                ]);
              } else {
                setSelectedPlatforms((prevPlatforms) =>
                  prevPlatforms.filter((platform) => platform !== "youtube")
                );
                // Remove the stream key when platform is deselected
                handleStreamKeyChange("youtube", "");
              }
            }}
          />
          YouTube
          {/* Input for entering the stream key for YouTube */}
          {selectedPlatforms.includes("youtube") && (
            <input
              type="text"
              placeholder="YouTube Stream Key"
              value={streamKeys.youtube}
              onChange={(e) =>
                handleStreamKeyChange("youtube", e.target.value)
              }
            />
          )}
        </label>
        <label>
          <input
            type="checkbox"
            value="facebook"
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedPlatforms((prevPlatforms) => [
                  ...prevPlatforms,
                  "facebook",
                ]);
              } else {
                setSelectedPlatforms((prevPlatforms) =>
                  prevPlatforms.filter((platform) => platform !== "facebook")
                );
                // Remove the stream key when platform is deselected
                handleStreamKeyChange("facebook", "");
              }
            }}
          />
          Facebook
          {/* Input for entering the stream key for YouTube */}
          {selectedPlatforms.includes("facebook") && (
            <input
              type="text"
              placeholder="Facebook Stream Key"
              value={streamKeys.facebook}
              onChange={(e) =>
                handleStreamKeyChange("facebook", e.target.value)
              }
            />
          )}
        </label>
        <label>
          <input
            type="checkbox"
            value="instagram"
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedPlatforms((prevPlatforms) => [
                  ...prevPlatforms,
                  "instagram",
                ]);
              } else {
                setSelectedPlatforms((prevPlatforms) =>
                  prevPlatforms.filter((platform) => platform !== "instagram")
                );
                // Remove the stream key when platform is deselected
                handleStreamKeyChange("instagram", "");
              }
            }}
          />
          Instagram
          {/* Input for entering the stream key for YouTube */}
          {selectedPlatforms.includes("instagram") && (
            <input
              type="text"
              placeholder="Instagram Stream Key"
              value={streamKeys.instagram}
              onChange={(e) =>
                handleStreamKeyChange("instagram", e.target.value)
              }
            />
          )}
        </label>
        {/* Add similar checkbox inputs and input fields for other platforms (e.g., Facebook, Instagram) */}
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

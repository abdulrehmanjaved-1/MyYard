import React, { useCallback, useState } from 'react'
import {useSocket} from "../context/SocketProvider"
import ReactPlayer from "react-player"

function LobbyScreen() {
  const [room, setRoom] = useState("")
  const [stream, setStream] = useState()
  const socket=useSocket();
  const handleStartStreaming = useCallback(async (e) => {
    e.preventDefault();
  
    try {
      const myStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
  
      // Now that you have the stream, you can set it as state or do further processing
      setStream(myStream);
  
      // // Assuming you have a WebSocket connection named "socket"
      // socket.on("SendStreamNow", (id) => {
      //   console.log('stream sent by ', id);
      // });
  
      myStream.getTracks().forEach((track) => {
        console.log("my stream is ", track);
        socket.emit("track", track); // Emit the track to the server
      });
  
      // Alternatively, you can send the whole stream object (not recommended, as mentioned earlier)
      // socket.emit("final", myStream);
  
    } catch (error) {
      // Handle any errors that might occur when getting the user's media
      console.error("Error getting user media:", error);
    }
  }, [socket]);
  
  
  return (
    <div>
      <h1>Lobby Screen</h1>
     
      <form onSubmit={handleStartStreaming}>
        <label htmlFor="room">Room No:</label>
        <input type="text" id='room' value={room} onChange={(e)=>setRoom(e.target.value)}/>
        <button>Start Streaming</button>
        {
        stream && (
        <>
        <h1>My Stream is ready</h1>
        <ReactPlayer height={300} width={300} playing muted url={stream}/>
        </>
        )
      }
      </form>
      
    </div>
  )
}

export default LobbyScreen
import React, { useCallback, useState } from 'react'
import {useSocket} from "../context/SocketProvider"
import ReactPlayer from "react-player"

function LobbyScreen() {
  const [room, setRoom] = useState("")
  const [stream, setStream] = useState()
  const socket=useSocket();
  const handleStartStreaming=useCallback(async (e)=>{
    e.preventDefault();
    socket.emit("Joined",room)
    const stream=await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true
    })
    setStream(stream)

    socket.on("SendStreamNow",(id)=>{
      console.log('stream sended by ',id)
    })
    
    socket.emit("final",stream)
  },[room,socket])
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
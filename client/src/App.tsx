import {BrowserRouter, Routes, Route} from "react-router-dom"
import Home from "./pages/HomePage"
import ChatPage from "./pages/ChatPage";
import { io, Socket } from "socket.io-client"

const socket: Socket = io("http://localhost:4000");

const App = () => {
  return (
     <BrowserRouter>
        <div>
          <Routes>
            <Route path="/" element={<Home socket={socket}/>}></Route>
            <Route path="/chat" element={<ChatPage socket={socket}/>}></Route>
          </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App
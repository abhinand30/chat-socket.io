import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import type { Socket } from 'socket.io-client'


interface HomeProps {
  socket: Socket;
}

const Home:React.FC<HomeProps> = ({ socket }) => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState("")

  const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  
    sessionStorage.setItem('userName', userName);
    socket.emit('newUser', userName );
    navigate('/chat')
  };

  return (
    <div className="flex items-center justify-center h-screen text-center">
      <form
        className="w-[400px] h-[400px] flex flex-col justify-center items-center border-2 border-amber-600 gap-6 py-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-semibold ">Login To Chat</h2>
       <div className='w-[80%] mx-2 text-start'>
        <label className="block text-sm/6 font-medium text-gray-900">Enter UserName</label>
        <div className="mt-2 ">
          <input type={"text"} name={userName} required onChange={e => setUserName(e.target.value)} className="block w-full h-10 rounded-md bg-white py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
        </div>
        </div>
        <button
          type="submit"
          className="w-[80%] px-4 py-2 h-10 bg-[#607EAA] text-[#F9F5EB] rounded-md text-sm hover:bg-[#486f97]"
        >
          Login
        </button>
      </form>
    </div>

  )
}

export default Home
import React, { useState } from 'react';
import NewUserModal from './Modal';

type UserType = {
  socketID: string;
  userName: string;
};

type SidebarProps = {
  socket: any;
  users: any;
  activeUser: UserType | null;
  setActiveUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  rooms: any;
  setActiveRoom: React.Dispatch<React.SetStateAction<string | null>>;
  activeRoom:string|null;
};

const Sidebar: React.FC<SidebarProps> = ({ socket, users, activeUser, setActiveUser, rooms, setActiveRoom,activeRoom }) => {
  const userName = sessionStorage.getItem('userName');
  const [showModal, setShowModal] = useState(false);
  const [roomsId, setRoomsId] = useState<string>('');

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);


  const handleNewRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    socket.emit('joinRoom', roomsId);
    setShowModal(false);
    setRoomsId('')
  }
  const handleActiveUser = (userName: string) => {
    setActiveUser({ userName: userName, socketID: users[userName] });
    setActiveRoom(null)
  }

  const handleActiveRoom = (room: string) => {
    setActiveRoom(room);
    setActiveUser(null)
  }


  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Online Users</h2>
        <p className="text-sm text-gray-500">Logged in as: {userName}</p>
      </div>
      <ul className="space-y-2">
        <p className='text-gray-500'>Users</p>

        {Object.keys(users).filter(userName => users[userName] !== socket.id).map(userName => (
          <li
            key={userName}
            className={`p-3 rounded-lg cursor-pointer ${activeUser?.socketID === users[userName]
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
            onClick={() => handleActiveUser(userName)}
          >
            {userName}
          </li>
        ))}
      </ul>

      {/* Group List */}
      <div className="mt-5 ">
        <div className='flex justify-between items-center mb-4'>
          <p className='text-gray-500'>Groups</p>
          <button className='h-8 w-8 bg-blue-400 text-white rounded-sm' onClick={handleOpenModal}>+</button>
        </div>

        <ul>{Object.keys(rooms).length > 0 && Object.keys(rooms).map((room, index) =>
          <li key={index} className={`p-3 rounded-lg mt-2 ${room===activeRoom? 'bg-blue-500 text-white': 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => handleActiveRoom(room)}>{room}</li>
        )}

        </ul>
        {showModal && (
          <NewUserModal onClose={handleCloseModal} handleNewRoom={handleNewRoom} setRoomsId={setRoomsId} roomsId={roomsId} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
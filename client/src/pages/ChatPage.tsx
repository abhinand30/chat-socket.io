import React, { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

import Sidebar from '../components/Sidebar';
import ChatBody from '../components/ChatBody';
import ChatFooter from '../components/ChatFooter';

type MessageType = {
  sender: string;
  message: string;
  from: string;
};
type UserType = {
  socketID: string;
  userName: string;
};
type ChatPageProps = {
  socket: Socket;
};
type messageType = { sender: string; message: string; senderSocketID: string; }

const ChatPage: React.FC<ChatPageProps> = ({ socket }) => {
  const userName = sessionStorage.getItem("userName") || "";

  const [messageStore, setMessageStore] = useState<{ [socketID: string]: MessageType[] }>({});
  const [activeUser, setActiveUser] = useState<UserType | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [users, setUsers] = useState<any>({});
  const [rooms, setRooms] = useState<any>([]);
  const [roomMessages, setRoomMessages] = useState<{ [roomId: string]: MessageType[] }>({});
  const [update,setUpdate]=useState<boolean>(false)
  
  useEffect(() => {
    socket.emit("getUsers");
    socket.emit("getRooms");
    socket.on("privateMessageResponse", handleMessage);
    socket.on("newUserResponse", handleNewUsers);
    socket.on("newRoomResponse", handleRooms);
    return () => {
      socket.off("privateMessageResponse", handleMessage);
      socket.off("newUserResponse", handleNewUsers);
      socket.off("newRoomResponse", handleRooms);
    };
  }, [socket, activeUser,update]);

  const handleRooms = (rooms: any) => {
    setRooms(rooms);
  }

  useEffect(() => {
    socket.emit("getRooms");
    socket.on("newRoomResponse", handleRooms);
    socket.on("roomMessage", handleRoomMessage);
    if (activeRoom) {
      socket.emit("joinRoom", activeRoom, userName);
    }
    return () => {
      socket.off("roomMessage");
    };
  }, [socket, activeRoom,update]);


    // when new user login to show existing users list and messages
  const handleNewUsers = (newUsers: UserType[]) => {
    setUsers(newUsers);
    for (const userId in newUsers) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }}
    setMessageStore(prev => {
      const currentSocketIDs = Object.values(users);
      return Object.fromEntries(
        Object.entries(prev).filter(([socketID]) =>
          currentSocketIDs.includes(socketID)
        ));
    });

  };
  // 
  const handleRoomMessage=({ sender, message }:any) => {
      setRoomMessages(prev => ({
        ...prev,
        [activeRoom!]: [...(prev[activeRoom!] || []), { sender, message, from: "other" }]
      }));
    }

 // send group message
  const handleSendRoomMessage = (text: string) => {
    if (!activeRoom || !text.trim()) return;
    socket.emit("groupMessage", {
      sender: userName,
      roomId: activeRoom,
      message: text
    });
    // save sended message
    setRoomMessages(prev => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), { sender: "You", message: text, from: "me" }]
    }));
  };

  // receives message from other user
  const handleMessage = (data: messageType) => {
    setMessageStore(prev => {
      if (data.senderSocketID === socket.id) return prev;
      return {
        ...prev,[data.senderSocketID]: [...(prev[data.senderSocketID] || []),
          {
            sender: data.sender,
            message: data.message,
            from: "other",
            timestamp: new Date().toISOString()
          }
        ]
      };
    });
  };

  // send Message to an user
  const handleSendMessage = (text: string) => {
    if (!activeUser || !text.trim()) return;

    const msgData = {
      sender:userName,
      receiverSocketId: activeUser.socketID,
      message: text,
    };
    socket.emit("privateMessage", msgData);
    setMessageStore(prev => ({
      ...prev,
      [activeUser.socketID]: [...(prev[activeUser.socketID] || []),
      { sender: "You", message: text, from: "me" }]
    }));
  };


  const messages = activeRoom ? roomMessages[activeRoom] || [] : activeUser ? messageStore[activeUser.socketID] || [] : [];


  return (
    <div className="flex w-screen h-screen overflow-hidden bg-gray-100">

      <div className="w-64 h-full bg-white border-r shadow-md">
        <Sidebar
          socket={socket}
          users={users}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          rooms={rooms}
          setActiveRoom={setActiveRoom}
          activeRoom={activeRoom}
          setUpdate={setUpdate}
          update={update}
        />
      </div>


      <div className="flex flex-col flex-1 h-full">
        {activeUser || activeRoom ? (
          <>
            <div className="flex-1 overflow-hidden">
              <ChatBody messages={messages} activeUser={activeUser} activeRoom={activeRoom} />
            </div>
            <div className="p-4 bg-white border-t">
              <ChatFooter onSend={activeRoom ? handleSendRoomMessage : handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 justify-center items-center text-gray-500">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
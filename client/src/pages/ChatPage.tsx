import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBody from '../components/ChatBody';
import ChatFooter from '../components/ChatFooter';
import type { Socket } from 'socket.io-client';

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
  const [messageStore, setMessageStore] = useState<{ [socketID: string]: MessageType[] }>({});
  const [activeUser, setActiveUser] = useState<UserType | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [users, setUsers] = useState<any>({});
  const [rooms, setRooms] = useState<any>([]);
  const [roomMessages, setRoomMessages] = useState<{ [roomId: string]: MessageType[] }>({});

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
  }, [socket, activeUser?.socketID]);

  const handleRooms = (rooms: any) => {
    setRooms(rooms);
  }

  useEffect(() => {
    socket.on("roomMessage", ({ sender, message }) => {
      setRoomMessages(prev => ({
        ...prev,
        [activeRoom!]: [...(prev[activeRoom!] || []), { sender, message, from: "other" }]
      }));
    });

    return () => {
      socket.off("roomMessage");
    };
  }, [socket, activeRoom]);

  useEffect(() => {
    if (activeRoom) {
       const userName = sessionStorage.getItem("userName") || "";
      socket.emit("joinRoom", activeRoom,userName);
    }
  }, [activeRoom]);


  const handleSendRoomMessage = (text: string) => {
    if (!activeRoom || !text.trim()) return;
    const sender = sessionStorage.getItem("userName") || "";
    socket.emit("groupMessage", {
      sender: sender,
      roomId: activeRoom,
      message: text
    });

    setRoomMessages(prev => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), { sender: "You", message: text, from: "me" }]
    }));
  };


  const handleMessage = (data: messageType) => {
    setMessageStore(prev => {
      if (data.senderSocketID === socket.id) return prev;
      return {
        ...prev,
        [data.senderSocketID]: [
          ...(prev[data.senderSocketID] || []),
          {
            sender: data.sender,
            message: data.message,
            from: "other",
            timestamp: new Date().toISOString()
          }
        ]
      };
    });
    if (activeUser?.socketID !== data.senderSocketID) {

    }
  };



  // when new user login to show existing users list and messages
  const handleNewUsers = (newUsers: UserType[]) => {

    setUsers(newUsers);

    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }

    setMessageStore(prev => {
      const currentSocketIDs = Object.values(users);
      return Object.fromEntries(
        Object.entries(prev).filter(([socketID]) =>
          currentSocketIDs.includes(socketID)
        )
      );
    });

  };

  //
  const handleSendMessage = (text: string) => {
    if (!activeUser || !text.trim()) return;

    const msgData = {
      sender: sessionStorage.getItem("userName") || "",
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

 
  const messages = activeRoom? roomMessages[activeRoom] || []: activeUser? messageStore[activeUser.socketID] || []: [];


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
        />
      </div>


      <div className="flex flex-col flex-1 h-full">
        {activeUser||activeRoom ? (
          <>
            <div className="flex-1 overflow-hidden">
              <ChatBody messages={messages} activeUser={activeUser} activeRoom={activeRoom}/>
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
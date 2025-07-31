    import React from 'react';

    interface ModalTypes{
      onClose: () => void;
      handleNewRoom:(e: React.FormEvent<HTMLFormElement>) => void;
      setRoomsId:React.Dispatch<React.SetStateAction<string>>,
      roomsId:string
    }


    function NewUserModal({ onClose,handleNewRoom,setRoomsId,roomsId }:ModalTypes) {

      return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Create New Group</h2>
            {/* Your new user form goes here */}
            <form onSubmit={handleNewRoom}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Group Name:
                </label>
                <input
                  type="text"
                  id={roomsId}
                  value={roomsId}
                  onChange={(e)=>setRoomsId(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
             
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    export default NewUserModal;
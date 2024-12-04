import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";

export const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate=useNavigate()
  const createNewRoom = () => {
    const id = uuidV4(); //for random id generation(for new room)
    setRoomId(id);
    toast.success("Created a new room");
  };

  const joinRoom=()=>{
     if(!userName || !roomId){
        toast.error("Username & Room Id is required")
        return
     }

     navigate(`/editor/${roomId}`,{
        state:{                                              //state concept in navigate is similar to redux concept basically used for   data transfer from one route to another here username is transferred
            userName
        }
     })
  }

  const handleKeyEnter=(e)=>{
    if(e.code === 'Enter'){
        joinRoom();
    }
  }

  return (
    <div className="flex items-center justify-center h-[100vh]">
      <div className="bg-[#282a36] p-[20px] w-[400px] max-w-[90%] rounded-lg">
        <img
          className="mb-[20px] h-[80px]"
          src="/code-sync.png"
          alt="code-sync-logo"
        />
        <h4 className="mt-0 mb-[8px] text-sm font-medium">
          Paste invitation ROOM ID
        </h4>
        <div className="flex flex-col">
          <input
            type="text"
            className="bg-[#eee] rounded-md outline-none border-none text-[#282a36] mb-[14px] text-sm font-semibold p-[8px]"
            placeholder="ROOM ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handleKeyEnter}
          />

          <input
            type="text"
            className="bg-[#eee] rounded-md text-[#282a36] outline-none border-none mb-[14px] text-sm font-semibold p-[8px]"
            placeholder="USERNAME"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyUp={handleKeyEnter}
          />
          <button className="border-none p-[10px] rounded-md text-sm cursor-pointer transition-all ease-in-out ml-auto bg-[#4aed88] w-[80px] duration-75 hover:bg-[#2b824c]" onClick={joinRoom}>
            Join
          </button>
          <span className="text-sm text-center mt-[10px]">
            If you don't have an invite then create &nbsp;
            <Link
              to=""
              onClick={createNewRoom}
              className="text-[#4aed88] border-b-[1px] border-b-[#4aed88] transition-all duration-75 ease-in-out hover:text-[#368654] hover:border-b-[#368654]"
            >
              new room
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

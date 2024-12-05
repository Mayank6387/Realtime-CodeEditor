import React, { useEffect, useRef, useState } from "react";
import Client from "../components/Client";
import { Editor } from "../components/Editor";
import { initSocket } from "../socket";
import axios from "axios";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null); //for storing the code for sync purpose for the immediate joiner
  const location = useLocation(); // useLocation current page ka URL details deta hai.
  const { roomId } = useParams(); //for accessing the dynamic url part i.e. /editor/:roomId
  const reactNavigator = useNavigate();
  const [output,setOutput]=useState('');
  const [outputVisible,setOutputVisible]=useState(false);

  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      //Join room
      socketRef.current.emit("join", {
        //frontend to backend
        roomId,
        username: location.state?.userName,
      });

      //Listening for Joining the room (on is basically a listener)
      socketRef.current.on("join", ({ clients, username, socketId }) => {
        if (username !== location.state?.userName) {
          toast.success(`${username} joined room`);
        }
        setClients(clients);

        socketRef.current.emit("sync-code", {
          code: codeRef.current,
          socketId,
        });
      });

      //Listening for Disconnection

      socketRef.current.on("disconnected", ({ socketId, username }) => {
        console.log(`Disconnected ${username}`);
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    //Whenever we have used listeners then we should always clean up the listeners as if not done it may cause memory leak problem

    return () => {
      //useEffect's return is a by default cleaning function as it runs when the component unmounts.

      //For unsubscribing the following events
      socketRef.current.off("join");
      socketRef.current.off("disconnected");

      //For completely disconnect the sockets
      socketRef.current.disconnect();
    };
  }, []);
  //compiler
  const compileCode = async (languageId, sourceCode, input = "") => {
    const payload = {
      language_id: languageId, // Language ID (e.g., 52 for Python 3)
      source_code: sourceCode,
      stdin: input,
    };
    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key":
            process.env.REACT_APP_API_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          },
        }
      );
      return response.data; // Contains output, error, etc.
    } catch (error) {
      return null;
    }
  };
  const handleCompile = async () => {
    const code = codeRef.current;
    const languageId = 63;
    const input = "";
    const result = await compileCode(languageId, code, input);
    if (result) {
      console.log("Output", result.stdout);
      setOutputVisible(true)
      setOutput(result.stdout)
    } else {
      toast.error("Failed to compile the code");
    }
  };
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Successfully copied your Room Id");
    } catch (error) {
      toast.error("Failed to copy Room Id");
      console.log(error.message);
    }
  };

  const leaveRoom = () => {
    reactNavigator("/");
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }
  return (
    <div className="grid grid-cols-[230px_1fr] h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="bg-[#1c1e29] p-4 text-white flex flex-col justify-between h-[100vh]">
        {/* Top Section */}
        <div>
          <div className="border-b border-[#424242] pb-4">
            <img className="h-16" src="/code-sync.png" alt="logo" />
          </div>
          <h3 className="mt-4">Connected</h3>
          <div className="flex items-center flex-wrap gap-5 mt-4 overflow-y-auto">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        {/* Bottom Section (Buttons) */}
        <div className="mt-4 space-y-4">
        <button
            className="border-none p-2 rounded-md text-sm font-semibold cursor-pointer transition-all ease-in-out bg-green-700 w-full duration-75 hover:bg-green-500"
            onClick={handleCompile}
          >
            Compile
          </button>
          <button
            className="border-none p-2 rounded-md text-sm cursor-pointer transition-all ease-in-out bg-blue-800 w-full duration-75 hover:bg-blue-500 font-semibold"
            onClick={copyRoomId}
          >
            Copy ROOM ID
          </button>
          <button
            className="border-none p-2 rounded-md text-sm font-semibold cursor-pointer transition-all ease-in-out bg-red-800 w-full duration-75 hover:bg-red-500"
            onClick={leaveRoom}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Editor Section */}
      <div className="h-full">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
      <div
      className={`fixed bottom-0 right-0 m-auto w-full bg-zinc-700 text-white p-4 transition-transform duration-300 ${
        outputVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ height: "20%", width:"40%"}}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Output</h3>
        <button
          className="text-sm font-semibold bg-red-700 px-4 py-1 rounded hover:bg-red-500"
          onClick={() => setOutputVisible(false)}
        >
          Close
        </button>
      </div>
      <pre className="mt-2 overflow-auto h-full">{output}</pre>
    </div>
    </div>
  );
};

export default EditorPage;

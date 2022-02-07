import React, { useEffect } from "react";
import { useGame } from "../contexts/Game";

export function Chat({ hidden, setHidden }) {
  const { socket } = useGame();
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const inputRef = React.useRef(null);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    const chatMesssageHandler = (message) => {
      setMessages((messages) => [...messages, message]);
    };
    socket.on("chat_message", chatMesssageHandler);
    return () => {
      socket.off("chat_message", chatMesssageHandler);
    };
  }, [socket]);

  useEffect(() => {
    if (scrollRef?.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  const sendMessage = () => {
    if (message) socket.emit("chat_message", message);
  };

  if (hidden) return null;

  return (
    <>
      <div
        className="absolute w-full h-full flex items-center justify-center bg-black opacity-20 pointer-events-auto"
        onClick={() => setHidden(true)}
      ></div>
      <div
        className="w-96 bg-black opacity-80 z-10 rounded-2xl flex flex-col pointer-events-auto"
        style={{ width: "40rem", height: "40rem" }}
      >
        <div
          className="flex-1 border-gray-500 border rounded-2xl mx-6 mt-6 mb-3 overflow-scroll hide-scrollbar"
          ref={scrollRef}
        >
          {messages.map((message, index) => (
            <div key={index} className="flex items-center p-2 text-xl">
              <div className="w-4 h-4 rounded-full bg-gray-200 mr-2"></div>
              <div className="text-white">{message}</div>
            </div>
          ))}
        </div>
        <div className="h-12 border-gray-500 border rounded-full box-border m-6 ">
          <input
            className="w-full h-full px-4 outline-none bg-transparent text-white text-xl"
            placeholder="Say something..."
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setHidden(true);
              } else if (e.key === "Enter") {
                if (!message) setHidden(true);
                sendMessage();
                setMessage("");
              } else e.stopPropagation();
            }}
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

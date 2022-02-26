import React, { useEffect } from "react";
import { useGame } from "../../contexts/Game";

export function Chat({ hidden, setHidden }) {
  const { socket, debugMode } = useGame();
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [typedMessages, setTypedMessages] = React.useState([]);
  const [typedMessageIndex, setTypedMessageIndex] = React.useState(-1);
  const inputRef = React.useRef(null);
  const scrollRef = React.useRef(null);

  if (debugMode) {
    // console.log("Messages: ", { message, typedMessages, messages });
  }

  useEffect(() => {
    const chatMesssageHandler = ({ desc: message }) => {
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
  }, [messages, hidden]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  useEffect(() => {
    if (typedMessages.length > 0 && typedMessageIndex >= 0) {
      const message = typedMessages[typedMessageIndex];
      setMessage(message);
    }
  }, [typedMessageIndex, typedMessages]);

  useEffect(() => {
    setTypedMessageIndex(-1);
  }, [typedMessages]);

  const sendMessage = () => {
    if (!message) return;
    socket.emit("chat_message", message);
    setTypedMessages((typedMessages) =>
      message !== typedMessages[0] ? [message, ...typedMessages] : typedMessages
    );
  };

  const handleChange = (message) => {
    setMessage(message);
    setTypedMessageIndex(-1);
  };

  if (hidden) return null;

  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"
        onClick={() => setHidden(true)}
      ></div>
      <div
        className="w-96 bg-black opacity-80 z-10 rounded-2xl absolute bottom-2 right-2 flex flex-col pointer-events-auto"
        style={{ width: "40rem", height: "40rem" }}
      >
        <div
          className="flex-1 border-gray-500 border rounded-2xl mx-6 mt-6 mb-3 overflow-scroll hide-scrollbar"
          ref={scrollRef}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                "flex items-center p-2 text-lg" +
                (message[0] === "<" ? " text-white" : " text-gray-400")
              }
            >
              {/* <span className="w-2 h-2 rounded-full bg-gray-200 mr-2"></span> */}
              <div className="">{message}</div>
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
                sendMessage();
                handleChange("");
                setHidden(true);
              } else if (e.key === "ArrowUp") {
                if (typedMessageIndex < typedMessages.length - 1)
                  setTypedMessageIndex((index) => index + 1);
              } else if (e.key === "ArrowDown") {
                if (typedMessageIndex > 0)
                  setTypedMessageIndex((index) => index - 1);
                else if (typedMessageIndex === 0) {
                  handleChange("");
                }
              } else e.stopPropagation();
            }}
            ref={inputRef}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

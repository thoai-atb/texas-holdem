import React, { useEffect } from "react";
import { useGame } from "../contexts/Game";

function timeToReadMessage(message) {
  return Math.max(Math.ceil(message.length / 5) * 1000, 2000);
}

export function ChatBubble({ offset, seatIndex }) {
  const { socket } = useGame();
  const [messages, setMessages] = React.useState([]);
  useEffect(() => {
    const chatMesssageHandler = ({ content, senderID }) => {
      if (senderID !== seatIndex) return;
      setMessages((messages) => [content, ...messages]);
      const timeId = setTimeout(() => {
        setMessages((messages) => messages.splice(messages.length - 1, 1)); // remove last message
      }, timeToReadMessage(content));
      return () => clearTimeout(timeId);
    };
    socket.on("chat_message", chatMesssageHandler);
    return () => {
      socket.off("chat_message", chatMesssageHandler);
    };
  }, [socket, seatIndex]);
  if (!messages.length) return null;
  return (
    <div
      className="h-96 absolute bottom-full pointer-events-none"
      style={{
        width: "40rem",
        transform: `translateY(-${offset}rem)`,
      }}
    >
      <div
        className="bottom-0 rounded-xl p-4 w-fit max-w-lg absolute z-10 pointer-events-auto text-base text-black font-normal"
        draggable
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
        }}
      >
        {messages[0]}
        <div
          className="absolute top-full bg-white"
          style={{
            backgroundColor: "transparent",
            width: 0,
            height: 0,
            left: "30%",
            borderLeft: "0.5rem solid transparent",
            borderRight: "0.5rem solid transparent",
            borderTop: "1rem solid rgba(255, 255, 255, 0.7)",
          }}
        ></div>
      </div>
    </div>
  );
}

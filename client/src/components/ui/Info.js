import React, { useContext } from "react";
import { AiFillYoutube } from "react-icons/ai";
import { AppContext } from "../../App";

export function Info({ hidden, setHidden }) {
  const { darkMode } = useContext(AppContext);
  if (hidden) return null;
  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"
        onClick={() => setHidden(true)}
      ></div>
      <div
        className={
          "w-96 bg-opacity-95 z-10 rounded-2xl absolute top-8 px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up " +
          (darkMode ? " bg-black text-white" : " bg-white text-slate-700")
        }
        style={{ width: "30rem", height: "30rem" }}
      >
        <div className="text-xl font-bold text-center">Texas Hold'em Abis</div>
        <div className="text-lg mt-5">
          <TexasLi title="Description" />
          This is a home game of Texas Hold'em. You can play against computers
          or other players. Chips are free and are not saved if you leave the
          table.
        </div>
        <div className="text-lg mt-5">
          <TexasLi title="Author" />
          <div>lybaothoai@gmail.com (Please report here)</div>
        </div>
        <div className="text-lg  mt-5">
          <TexasLi title="Source Code" />
          <a
            target="_blank"
            href="https://github.com/thoai-atb/texas-holdem"
            rel="noreferrer"
            className="hover:text-blue-500"
          >
            https://github.com/thoai-atb/texas-holdem
          </a>
        </div>
        <div className="text-lg mt-5">
          <TexasLi title="Watch" />
          <a
            target="_blank"
            href="https://youtu.be/JpvW1T7hXjo?t=33"
            rel="noreferrer"
            className="hover:text-blue-500 block mt-2"
          >
            <AiFillYoutube className="inline-flex items-center justify-center text-xl" />{" "}
            Dramatic poker scene (how to play like pros)
          </a>
          <a
            target="_blank"
            href="https://youtu.be/dQw4w9WgXcQ"
            rel="noreferrer"
            className="hover:text-blue-500 block mt-2"
          >
            <AiFillYoutube className="inline-flex items-center justify-center text-xl" />{" "}
            Fake poker scene (how not to play poker)
          </a>
        </div>
      </div>
    </>
  );
}

const TexasLi = ({ title }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div>
      <span
        className={
          "inline-block w-2 h-2 mr-2 rounded-full" +
          (darkMode ? " bg-cyan-300" : " bg-slate-700")
        }
      ></span>
      <span className="font-semibold">{title}</span>
    </div>
  );
};

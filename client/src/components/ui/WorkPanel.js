import React, { useContext, useEffect, useState } from "react";
import { useSoundContext } from "../../contexts/Sound";
import moneyPng from "../../assets/texture/one-thousand-dollars.png";
import { AppContext } from "../../App";

const MAX_SCORE = 10;
const NORMAL_INFO = [
  "good",
  "life is money",
  "you gotta do what you gotta do",
  "no money no life",
  "take it easy",
  "do you job",
  "almost there",
  "get your money",
  "sugar is sweet",
  "just do it",
  "hit the button",
  "don't rush",
  "money is money",
  "good morning mister",
  "good work",
  "keep going",
  "make it worth",
];
const BAD_INFO = [
  "don't gamble kid!",
  "sorry kid!",
  "wasting my time!",
  "what cha doing man?",
  "hey watch out!",
  "what's wrong?",
  "hold on mister",
  "better becareful!",
  "oh no!",
  "look out!",
  "you were paid to do this!",
  "bad weather young man!",
];
const GOOD_INFO = [
  "good job kid!",
  "congratulations!",
  "give ya some bonus!",
  "hey, here's some boost!",
  "good, take my taco here!",
  "that's amazing!",
  "nice job!",
  "you're promoted!",
  "well done!",
];

export function WorkPanel({ hidden, setHidden }) {
  const { socket } = useContext(AppContext);
  const { playMiscSound } = useSoundContext();
  const [progress, setProgress] = useState(0);
  const [buttonActive, setButtonActive] = useState(true);
  const [lastDifference, setLastDifference] = useState(0); // this is for the info panel
  const [finished, setFinished] = useState(false);

  function getDiff() {
    const pool = [1, 1, 1, 1, 1, 1, 1, 1, 1, -2, -2, -2, 3];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function handleClick() {
    setButtonActive(false);
    const diff = getDiff();
    setLastDifference(diff);
    setProgress((progress) => Math.max(progress + diff, 0));
    var timeout = 1000;
    if (diff < 1) {
      timeout = 2000;
      playMiscSound("ting");
    } else if (diff > 1) {
      timeout = 1000;
      playMiscSound("old-button");
    } else {
      timeout = 1000;
      playMiscSound("old-button");
    }
    setTimeout(() => setButtonActive(true), timeout);
  }

  function exitWork() {
    setProgress(0);
    setFinished(false);
    setHidden(true);
    playMiscSound("old-button");
    socket.emit("player_action", { type: "work" });
  }

  useEffect(() => {
    if (progress >= MAX_SCORE && !finished) {
      setProgress(MAX_SCORE);
      setFinished(true);
      playMiscSound("cash-register");
    }
  }, [progress, finished, playMiscSound]);

  if (hidden) return null;
  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto anima"
        onClick={() => setHidden(true)}
      ></div>
      <div
        className="absolute w-96 bg-white bg-opacity-95 z-10 rounded-2xl top-20 px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up"
        style={{ width: "50rem", height: "40rem" }}
      >
        <div className="text-xl text-slate-700 font-bold text-center">
          WORK FOR MONEY
        </div>
        <ProgressBar progress={progress} />
        {!finished && (
          <>
            <InfoBar
              buttonActive={buttonActive}
              lastDifference={lastDifference}
            />
            <WorkButton
              handleClick={handleClick}
              buttonActive={buttonActive}
              lastDifference={lastDifference}
            />
          </>
        )}
        {finished && (
          <>
            <div className="w-full h-full flex flex-col items-center">
              <div className="text-2xl">Here is your paycheck!</div>
              <div
                className=""
                style={{
                  width: "30rem",
                  height: "20rem",
                  backgroundImage: `url(${moneyPng})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              />
              <div className="text-6xl text-yellow-600">$1000</div>
            </div>
            <button
              onClick={() => exitWork()}
              className="text-2xl hover:text-cyan-500"
            >
              Thanks! I need it to support my family!
            </button>
          </>
        )}
      </div>
    </>
  );
}

function InfoBar({ buttonActive, lastDifference }) {
  var info = null;
  var signColor = "";
  var signStr = "";
  if (!buttonActive) {
    if (lastDifference === 1) {
      info = NORMAL_INFO[Math.floor(Math.random() * NORMAL_INFO.length)];
      signColor = "text-black";
      signStr = "+" + lastDifference;
    } else if (lastDifference < 0) {
      info = BAD_INFO[Math.floor(Math.random() * BAD_INFO.length)];
      signColor = "text-red-500";
      signStr = lastDifference;
    } else if (lastDifference > 1) {
      info = GOOD_INFO[Math.floor(Math.random() * GOOD_INFO.length)];
      signColor = "text-lime-500";
      signStr = "+" + lastDifference;
    }
  }
  return (
    <div className={"w-full text-center text-2xl h-20 " + signColor}>
      {info} {!buttonActive && <span className={signColor}>{signStr}</span>}
    </div>
  );
}

function WorkButton({ handleClick, buttonActive, lastDifference }) {
  const buttonColor = (() => {
    if (buttonActive) return "bg-red-500";
    if (lastDifference < 0) return "bg-gray-500";
    if (lastDifference > 1) return "bg-lime-500";
    return "bg-red-500";
  })();
  return (
    <div className="w-full h-full flex items-center justify-center">
      <button
        className={
          "relative ease-in-out transition-all group" +
          (buttonActive ? " active:translate-y-2" : "")
        }
        disabled={!buttonActive}
        onClick={() => handleClick()}
      >
        <div
          className={`${buttonColor} w-40 h-28 shadow-2xl shadow-black`}
          style={{ borderRadius: "50%" }}
        ></div>
        <div
          className={`${buttonColor} w-40 h-28 shadow-2xl shadow-black absolute -top-2`}
          style={{ borderRadius: "50%" }}
        ></div>
      </button>
    </div>
  );
}

function ProgressBar({ progress }) {
  // interpolateColor by ChatGPT
  function interpolateColor(value) {
    value = Math.min(1, Math.max(0, value));
    const hue = value * 120;
    const hslToRgb = (h, s, l) => {
      h /= 360;
      s /= 100;
      l /= 100;
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hueToRgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
      }
      return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
        b * 255
      )})`;
    };
    return hslToRgb(hue, 100, 50);
  }

  function getColor(index, max) {
    if (index >= progress) return "rgb(200,200,200)";
    return interpolateColor((index + 1) / max);
  }

  return (
    <div className="w-full flex gap-1 p-8 mt-4">
      {Array.from({ length: MAX_SCORE }, (_, index) => {
        return (
          <div
            className={
              "flex-1 h-2 transition-colors duration-500"
              // (index < progress ? " bg-lime-500" : " bg-gray-200")
            }
            style={{ backgroundColor: getColor(index, MAX_SCORE) }}
            key={index}
          ></div>
        );
      })}
    </div>
  );
}

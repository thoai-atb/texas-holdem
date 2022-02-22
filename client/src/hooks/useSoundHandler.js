/*
 * File: useSoundHandler.js
 * Project: texas-holdem
 * File Created: Tuesday, 22nd February 2022 7:28:18 pm
 * Author: Lý Bảo Thoại (v.thoaily@vinbrain.net)
 *
 * Copyright 2022 VinBrain JSC
 */

import { useEffect } from "react";
import useSound from "use-sound";
import chipsSound from "../assets/sounds/chips.wav";
import tapSound from "../assets/sounds/tap.wav";
import throwSound from "../assets/sounds/throw.wav";
import winSound from "../assets/sounds/ba_dum_tss.wav";
import cardFlipSound from "../assets/sounds/card_flip.wav";

export const useSoundHandler = ({ socket }) => {
  const [playChips] = useSound(chipsSound, {
    interrupt: true,
  });
  const [playTap] = useSound(tapSound, {
    interrupt: true,
    volume: 5.0,
  });
  const [playThrow] = useSound(throwSound, {
    interrupt: true,
    volume: 3.0,
  });
  const [playWin] = useSound(winSound, {
    interrupt: true,
  });
  const [playFlip] = useSound(cardFlipSound, {
    interrupt: true,
  });

  useEffect(() => {
    socket.on("sound_effect", (sound) => {
      if (sound === "chips") playChips();
      if (sound === "tap") playTap();
      if (sound === "throw") playThrow();
      if (sound === "win") playWin();
      if (sound === "flip") playFlip();
    });
    return () => {
      socket.off("sound_effect");
    };
  }, [socket, playChips, playTap, playThrow, playWin, playFlip]);
};

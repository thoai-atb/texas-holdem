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
import bubbleClickSound from "../assets/sounds/bubble_click.wav";
import stickClickSound from "../assets/sounds/stick_click.wav";

export const useSoundHandler = ({ socket, muted }) => {
  const [playChips] = useSound(chipsSound, {
    interrupt: true,
    volume: 2.0,
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
  const [playBubbleClick] = useSound(bubbleClickSound, {
    interrupt: true,
    volume: muted ? 0.0 : 1.0,
  });
  const [playStickClick] = useSound(stickClickSound, {
    interrupt: true,
    volume: muted ? 0.0 : 1.0,
  });

  useEffect(() => {
    if(!socket || muted) return;
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
  }, [socket, playChips, playTap, playThrow, playWin, playFlip, muted]);

  return {
    playChips,
    playTap,
    playThrow,
    playWin,
    playFlip,
    playBubbleClick,
    playStickClick,
  }
};

import { useEffect, useState } from "react";
import useSound from "use-sound";
import chipsSound from "../assets/sounds/chips.wav";
import tapSound from "../assets/sounds/tap.wav";
import throwSound from "../assets/sounds/throw.wav";
import winSound from "../assets/sounds/ba_dum_tss.wav";
import cardFlipSound from "../assets/sounds/card_flip.wav";
import bubbleClickSound from "../assets/sounds/bubble_click.wav";
import stickClickSound from "../assets/sounds/stick_click.wav";

export const useSoundHandler = ({ socket, muted }) => {
  const [volume, setVolume] = useState(1);
  console.log(volume);
  const [playChips] = useSound(chipsSound, {
    interrupt: true,
    volume: 1.5 * volume,
  });
  const [playTap] = useSound(tapSound, {
    interrupt: true,
    volume: 5.0 * volume,
  });
  const [playThrow] = useSound(throwSound, {
    interrupt: true,
    volume: 3.0 * volume,
  });
  const [playWin] = useSound(winSound, {
    interrupt: true,
    volume: volume,
  });
  const [playFlip] = useSound(cardFlipSound, {
    interrupt: true,
    volume: volume,
  });
  const [playBubbleClick] = useSound(bubbleClickSound, {
    interrupt: true,
    volume: muted ? 0.0 : volume,
  });
  const [playStickClick] = useSound(stickClickSound, {
    interrupt: true,
    volume: muted ? 0.0 : volume,
  });

  useEffect(() => {
    if (!socket || muted) return;
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
    volume,
    setVolume,
  };
};

import { useCallback, useEffect, useState } from "react";
import useSound from "use-sound";
import chipsSound from "../assets/sounds/chips.wav";
import tapSound from "../assets/sounds/tap.wav";
import throwSound from "../assets/sounds/throw.wav";
import baDumTssSound from "../assets/sounds/ba_dum_tss.wav";
import cardFlipSound from "../assets/sounds/card_flip.wav";
import bubbleClickSound from "../assets/sounds/bubble_click.wav";
import bubbleChatSound from "../assets/sounds/bubble_chat.wav";
import stickClickSound from "../assets/sounds/stick_click.wav";
import cinematicBombSound from "../assets/sounds/cinematic_boom.wav";
import cinematicAlarmSound from "../assets/sounds/cinematic_alarm.wav";
import cashRegisterSound from "../assets/sounds/cash_register.wav";
import waterDropSound from "../assets/sounds/water_drop.wav";
import tingSound from "../assets/sounds/ting.wav";
import oldButtonSound from "../assets/sounds/old_button.wav";
import chipsCollectSound from "../assets/sounds/chips_collect.wav";
import bellSound from "../assets/sounds/bell.wav";
import doorSound from "../assets/sounds/door.wav";
import clapsSound from "../assets/sounds/claps.wav";

export const useSoundHandler = ({ socket, muted }) => {
  const [volume, setVolume] = useState(1);
  const [playChips] = useSound(chipsSound, {
    interrupt: true,
    volume: 1.5 * volume,
  });
  const [playTap] = useSound(tapSound, {
    interrupt: true,
    volume: 4.0 * volume,
  });
  const [playThrow] = useSound(throwSound, {
    interrupt: true,
    volume: 2.0 * volume,
  });
  const [playWin] = useSound(baDumTssSound, {
    interrupt: true,
    volume: volume,
  });
  const [playWinA] = useSound(cinematicBombSound, {
    interrupt: true,
    volume: volume,
  });
  const [playWinB] = useSound(cinematicAlarmSound, {
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
  const [playBubbleChat] = useSound(bubbleChatSound, {
    interrupt: true,
    volume: muted ? 0.0 : 0.5 * volume,
  });
  const [playStickClick] = useSound(stickClickSound, {
    interrupt: true,
    volume: muted ? 0.0 : volume,
  });
  const [playOldButtonSound] = useSound(oldButtonSound, {
    interrupt: true,
    volume: muted ? 0.0 : 0.5 * volume,
  });
  const [playWaterDropSound] = useSound(waterDropSound, {
    interrupt: true,
    volume: muted ? 0.0 : 0.5 * volume,
  });
  const [playTingSound] = useSound(tingSound, {
    interrupt: true,
    volume: muted ? 0.0 : 0.5 * volume,
  });
  const [playCashRegisterSound] = useSound(cashRegisterSound, {
    interrupt: true,
    volume: muted ? 0.0 : 0.5 * volume,
  });
  const [playChipsCollectSound] = useSound(chipsCollectSound, {
    interrupt: true,
    volume: muted ? 0.0 : 0.5 * volume,
  });
  const [playBellSound] = useSound(bellSound, {
    interrupt: true,
    volume: muted ? 0.0 : 0.5 * volume,
  });
  const [playDoorSound] = useSound(doorSound, {
    interrupt: true,
    volume: muted ? 0.0 : 0.5 * volume,
  });
  const [playClapsSound] = useSound(clapsSound, {
    interrupt: true,
    volume: muted ? 0.0 : 2 * volume,
  });

  const playMiscSound = useCallback(
    (soundName) => {
      if (soundName === "cash-register") playCashRegisterSound();
      else if (soundName === "water-drop") playWaterDropSound();
      else if (soundName === "ting") playTingSound();
      else if (soundName === "old-button") playOldButtonSound();
      else if (soundName === "chips-collect") playChipsCollectSound();
      else if (soundName === "bell") playBellSound();
      else if (soundName === "door") playDoorSound();
      else if (soundName === "claps") playClapsSound();
    },
    [
      playCashRegisterSound,
      playWaterDropSound,
      playTingSound,
      playOldButtonSound,
      playChipsCollectSound,
      playBellSound,
      playDoorSound,
      playClapsSound,
    ]
  );

  useEffect(() => {
    if (!socket || muted) return;
    socket.on("sound_effect", (sound) => {
      if (sound === "chips") playChips();
      if (sound === "tap") playTap();
      if (sound === "throw") playThrow();
      if (sound === "win") playWin();
      if (sound === "winStrong") playWinA();
      if (sound === "winStronger") playWinB();
      if (sound === "flip") playFlip();
      if (sound === "chipsCollect") playMiscSound("chips-collect");
      if (sound === "playerJoin") playMiscSound("bell");
      if (sound === "playerExit") playMiscSound("door");
      if (sound === "claps") playMiscSound("claps");
    });
    return () => {
      socket.off("sound_effect");
    };
  }, [
    socket,
    playChips,
    playTap,
    playThrow,
    playWin,
    playFlip,
    muted,
    playWinA,
    playWinB,
    playMiscSound,
  ]);

  return {
    playChips,
    playTap,
    playThrow,
    playWin,
    playWinA,
    playWinB,
    playFlip,
    playBubbleClick,
    playBubbleChat,
    playStickClick,
    playMiscSound,
    volume,
    setVolume,
  };
};

import React from "react";
import { useSoundContext } from "../../contexts/Sound";

export function VolumeOption() {
  const { volume, setVolume, playStickClick } = useSoundContext();
  const handleChange = (e) => {
    playStickClick();
    const value = e.target.value;
    setVolume(value * 0.1);
  };
  return (
    <div
      className="relative flex top-full right-5 w-48 h-16 items-center justify-center rounded-lg"
      onClick={(e) => e.stopPropagation()}
      title="Adjust Volume"
    >
      <input
        className="slider"
        type="range"
        min="0"
        max="10"
        value={volume / 0.1}
        onChange={handleChange}
      ></input>
    </div>
  );
}

import React from "react";
import { useSoundContext } from "../../contexts/Sound";

export function VolumeOption() {
  const { playStickClick, volume, setVolume } = useSoundContext();
  const handleChange = (e) => {
    const value = e.target.value;
    setVolume(value * 0.1);
    playStickClick();
  };
  return (
    <div
      className="absolute hidden group-hover:flex top-full right-5 w-48 h-16 items-center justify-center p-2 rounded-lg"
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

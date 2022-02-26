import React from "react";

export const SoundContext = React.createContext({});

export const useSoundContext = () => React.useContext(SoundContext);

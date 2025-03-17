import React, { createContext, useState, useEffect } from "react";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const loadMuteState = async () => {
      const savedMuteState = await AsyncStorage.getItem("isMuted");
      if (savedMuteState !== null) {
        setIsMuted(savedMuteState === "true");
      }
    };
    loadMuteState();
  }, []);

  const toggleMute = async () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    await AsyncStorage.setItem("isMuted", newMuteState.toString());

    await Audio.setIsEnabledAsync(!newMuteState); // Controla o som geral do app
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

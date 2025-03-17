import React, { createContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [muted, setMuted] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    // Carregar o som ao iniciar
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/click.mp3') // Substitua pelo seu som
      );
      setSound(sound);
    };

    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playSound = async () => {
    if (sound && !muted) {
      await sound.replayAsync();
    }
  };

  return (
    <AudioContext.Provider value={{ muted, setMuted, playSound }}>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;

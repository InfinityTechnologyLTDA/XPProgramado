// src/context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Atualizado
import { themes } from '../components/themes.js'; // Importando os temas


const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(themes.dark); // Tema padrão como 'dark'

  // Carregar o tema salvo no AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && themes[savedTheme]) {
          setCurrentTheme(themes[savedTheme]);
        } else {
          console.warn('Nenhum tema salvo encontrado. Usando o tema padrão.');
          setCurrentTheme(themes.dark);
        }
      } catch (error) {
        console.error('Erro ao carregar o tema. Usando o tema padrão.', error);
        setCurrentTheme(themes.dark);
      }
    };

    loadTheme();
  }, []);

  // Função para mudar o tema
  const switchTheme = async (themeName) => {
    if (!themes[themeName]) {
      console.error(`Tema '${themeName}' não encontrado`);
      return;
    }

    setCurrentTheme(themes[themeName]);
    try {
      await AsyncStorage.setItem('theme', themeName); // Salvar o tema no AsyncStorage
    } catch (error) {
      console.error('Erro ao salvar o tema', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };

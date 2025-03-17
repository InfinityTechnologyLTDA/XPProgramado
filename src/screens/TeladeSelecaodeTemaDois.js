import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Image, Platform, Animated } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import styles from '../components/style';
import { Audio } from 'expo-av';
import DarkSound from '../../assets/DarkSound.mp3';
import WhiteSound from '../../assets/WhiteSound.mp3';
import CelestialSound from '../../assets/CelestialSound.mp3';
import PinkSound from '../../assets/PinkSound.mp3';
import UnicornioSound from '../../assets/UnicornioSound.mp3';
import sounds from '../../assets/sounds.mp3';

const TelaDeSelecaodeTemaDois = ({ navigation }) => {
  const { currentTheme, switchTheme } = useContext(ThemeContext);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [prevBackground, setPrevBackground] = useState(currentTheme.background);
  // Valor animado para a transição de cor
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Defina fadeAnim no escopo do componente


// Quando a cor de fundo muda, dispara a animação
  useEffect(() => {
    if (prevBackground !== currentTheme.background) {
      colorAnim.setValue(0);
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false, // Animação de cores não suporta native driver
      }).start(() => {
        // Ao final da animação, atualiza a cor anterior
        setPrevBackground(currentTheme.background);
      });
    }
  }, [currentTheme.background]);

  // Interpolação entre a cor anterior e a nova cor
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [prevBackground, currentTheme.background],
  });






  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Opacidade final
      duration: 2000, // Tempo da animação
      useNativeDriver: false,
    }).start();
  }, []);

  // Funções para tocar os sons
  const playSound1 = async () => {
    const { sound } = await Audio.Sound.createAsync(DarkSound);
    await sound.playAsync();
  };

  const playSound2 = async () => {
    const { sound } = await Audio.Sound.createAsync(WhiteSound);
    await sound.playAsync();
  };

  const playSound3 = async () => {
    const { sound } = await Audio.Sound.createAsync(CelestialSound);
    await sound.playAsync();
  };

  const playSound4 = async () => {
    const { sound } = await Audio.Sound.createAsync(PinkSound);
    await sound.playAsync();
  };

  const playSound5 = async () => {
    const { sound } = await Audio.Sound.createAsync(UnicornioSound);
    await sound.playAsync();
  };

  const playSound6 = async () => {
    const { sound } = await Audio.Sound.createAsync(sounds);
    await sound.playAsync();
  };

  // Função para aplicar a seleção do tema e atualizar o estado
  const handleThemeSelection = (theme) => {
    setSelectedTheme(theme);
    switchTheme(theme);
  };

  // Função para gerar o estilo do botão, considerando o tema
  const getButtonStyle = (theme) => {
    const isSelected = selectedTheme === theme;
    const borderColor = isSelected 
      ? getThemeColor(theme, 'border') 
      : currentTheme.borderbutton;
    const shadowColor = isSelected 
      ? getThemeColor(theme, 'shadow') 
      : 'transparent';
    const borderWidth = theme === 'light' && isSelected ? 2 : 1.5;
    const shadowEffect = currentTheme.name === 'light' && isSelected ? {
      shadowColor: shadowColor,
      shadowOffset: { width: 10, height: 10 },
      shadowOpacity: 0.7,
      shadowRadius: 20,
      elevation: 20,
    } : {};

    return [
      styles.button,
      {
        backgroundColor: currentTheme.button,
        borderColor: borderColor,
        borderWidth: borderWidth,
        margin: 10,
        ...shadowEffect,
      },
    ];
  };

  // Função para obter a cor do tema
  const getThemeColor = (theme, type) => {
    switch (theme) {
      case 'dark':
        return type === 'border' ? '#3ee3f3' : '#3ee3f3';
      case 'light':
        return type === 'border' ? '#3ee3f3' : '#3ee3f3';
      case 'blue':
        return type === 'border' ? '#C0C0C0' : '#C0C0C0';
      case 'pink':
        return type === 'border' ? '#FF3EB5' : '#FF3EB5';
      case 'unicorn':
        return type === 'border' ? '#3ee3f3' : '#3ee3f3';
      default:
        return type === 'border' ? '#C0C0C0' : '#C0C0C0';
    }
  };

  return (
    // Usando fadeAnim na View para aplicar o efeito de fade-in
    <Animated.View style={[styles.container, { backgroundColor: backgroundColor
      , opacity: fadeAnim }]}>
      <Text style={[styles.title, { color: currentTheme.text, bottom: 25 }]}>
        Escolha a interface
      </Text>

      {/* Botões para troca de tema */}
      <TouchableOpacity
        style={getButtonStyle('dark')}
        onPress={() => {
          handleThemeSelection('dark');  
          playSound1();
        }}
      >
        <Text style={[styles.buttonText, { color: currentTheme.text2 }]}>Dark</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getButtonStyle('light')}
        onPress={() => {
          handleThemeSelection('light');
          playSound2();
        }}
      >
        <Text style={[styles.buttonText, { color: currentTheme.text2 }]}>Tech</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getButtonStyle('blue')}
        onPress={() => {
          handleThemeSelection('blue');
          playSound3();
        }}
      >
        <Text style={[styles.buttonText, { color: currentTheme.text2 }]}>Celestial</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getButtonStyle('pink')}
        onPress={() => {
          handleThemeSelection('pink');
          playSound4();
        }}
      >
        <Text style={[styles.buttonText, { color: currentTheme.text2 }]}>Kawai</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getButtonStyle('unicorn')}
        onPress={() => {
          handleThemeSelection('unicorn');
          playSound5();
        }}
      >
        <Text style={[styles.buttonText, { color: currentTheme.text2 }]}>Unicórnio</Text>
      </TouchableOpacity>

      {/* Botão para avançar */}
      <TouchableOpacity
        style={[styles.buttonLogin, { backgroundColor: currentTheme.button3, borderColor: currentTheme.borderbutton, borderWidth: 1.5, top: '7%' }]}
        onPress={() => {
          navigation.navigate('TelaPrincipal');
          playSound6();
        }}
      >
        <Text style={[styles.buttonText, { color: currentTheme.text3 }]}>Ativar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TelaDeSelecaodeTemaDois;

import React, { useState, useEffect } from "react";
import { TouchableOpacity, Image, StyleSheet, Animated, Dimensions, Text, View, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const streakImages = {
  0: require("../../assets/anelConsecultivo0Dias.png"),
  3: require("../../assets/anelConsecultivo3Dias.png"),
  7: require("../../assets/anelConsecultivo7Dias.png"),
  14: require("../../assets/anelConsecultivo14Dias.png"),
  30: require("../../assets/anelConsecultivo30Dias.png"),
};

// Função para calcular o streak de login
const checkLoginStreak = async () => {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastLogin = await AsyncStorage.getItem("lastLogin");
  const streak = await AsyncStorage.getItem("loginStreak");

  let newStreak = 1;

  if (lastLogin) {
    const lastLoginDate = new Date(parseInt(lastLogin)).setHours(0, 0, 0, 0);

    if (today === lastLoginDate) {
      return parseInt(streak); // Já logou hoje
    } else if (today - lastLoginDate === 86400000) {
      newStreak = parseInt(streak) + 1;
    }
  }

  await AsyncStorage.setItem("loginStreak", newStreak.toString());
  await AsyncStorage.setItem("lastLogin", today.toString());

  // Atualiza o multiplicador de XP com base no streak
  await updateXpMultiplier(newStreak);

  return newStreak;
};

const CheckLoginStreak = () => {
  const [streak, setStreak] = useState(0);
  const [xpMultiplier, setXpMultiplier] = useState(1.0);
  const [showMultiplier, setShowMultiplier] = useState(false); // Estado para mostrar ou esconder o XP

  useEffect(() => {
    const fetchStreak = async () => {
      const currentStreak = await checkLoginStreak();
      setStreak(currentStreak);
      const multiplier = await getXpMultiplier(currentStreak);
      setXpMultiplier(multiplier);
    };
    fetchStreak();
  }, []);

  const { width, height } = Dimensions.get("window");

  // Escolher a imagem correta com base no streak
  const getStreakImage = () => {
    if (streak >= 30) return streakImages[30];
    if (streak >= 14) return streakImages[14];
    if (streak >= 7) return streakImages[7];
    if (streak >= 3) return streakImages[3];
    return streakImages[0];
  };

  const getXpMultiplier = async (streak) => {
    let multiplier = 1.0;
    if (streak >= 30) multiplier = 1.5;
    else if (streak >= 14) multiplier = 1.4;
    else if (streak >= 7) multiplier = 1.3;
    else if (streak >= 3) multiplier = 1.2;

    await AsyncStorage.setItem("xpMultiplier", multiplier.toString());
    return multiplier;
  };

  const handlePress = () => {
    setShowMultiplier(true);

    // Esconde o XP após 1 segundo
    setTimeout(() => {
      setShowMultiplier(false);
    }, 3000);
  };

  return (
    <View style={{ alignItems: "center" }}>
      <Animated.View style={{ position: "absolute" }}>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Image source={getStreakImage()} style={[styles.image, { right: height * 0.02, bottom: width * 0.035 }]} />
        </TouchableOpacity>
      </Animated.View>

      {/* Exibe o multiplicador de XP somente se showMultiplier for true */}
      {showMultiplier && (
        <Text style={[styles.xpText, {    position:'absolute', right:height*-0.015
        }]}>{xpMultiplier.toFixed(1)}x de XP</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    margin:2
    
  },
  image: {
    width: 47,
    height: 47,
    resizeMode: "contain",
  },
  xpText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 40, // Ajusta a posição abaixo do botão
    color: "white",
    position:'absolute',
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
    textShadowColor: "rgba(255, 255, 255, 0.8)", // Sombra branca semi-transparente
    textShadowOffset: { width: 2, height: 2 }, // Pequeno deslocamento para dar efeito 3D
    textShadowRadius: 4, // Suaviza a sombra
  },
});

export default CheckLoginStreak;

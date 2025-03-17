import React, { useContext, useState } from "react";
import { TouchableOpacity, Image, Animated, Text, View, StyleSheet, Dimensions } from "react-native";
import { SoundContext } from "../components/SoundContext";

const MuteButton = () => {
  const { isMuted, toggleMute } = useContext(SoundContext);
  const [showText, setShowText] = useState(false);
  const { width, height } = Dimensions.get("window");
  

  const handlePress = () => {
    toggleMute();
    setShowText(true);
    setTimeout(() => setShowText(false), 1000); // Esconde o texto após 1 segundo
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress}>
        <Image
          source={isMuted ? require("../../assets/botaoSomOff.png") : require("../../assets/botaoSomOn.png")}
          style={styles.image}
        />
      </TouchableOpacity>
      {showText && (
        <Text style={styles.text}>{isMuted ? "Mutado" : "Som Ligado"}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "absolute",
    top:2
    
  },
  image: {
    width: '54',
    height: '50',
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    marginTop: 40,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    position: "absolute",
    textAlign:'center'

  },
});

export default MuteButton;

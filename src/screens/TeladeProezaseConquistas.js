import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, Animated, Dimensions } from "react-native";
import styles from '../components/style.js'; // Certifique-se de que esse arquivo existe

const TeladeProezaseConquistas = () => {
    // Estado para a animação de opacidade
    const [fadeAnim] = useState(new Animated.Value(0)); // Inicializa a opacidade como 0

    // Inicia a animação assim que o componente é montado
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1, // A opacidade vai até 1 (visível)
            duration: 2000, // Duração de 2 segundos
            useNativeDriver: true, // Usa o driver nativo para melhor performance
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
            <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
            TeladeProezaseConquistas
            </Animated.Text>
            <TouchableOpacity onPress={() => alert("Botão pressionado!")}>
                <Text>Pressione aqui</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default TeladeProezaseConquistas;

import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { ThemeContext } from '../context/ThemeContext'; // Importando o contexto de tema
import styles from '../components/style'; // Importando os estilos do style.js
import { loginUser } from '../services/firebase.js'; // Ajuste o caminho conforme necessário
import EnviarCodigo from './EnviarCodigo.js';
import { Audio } from 'expo-av';
import somDeLogin from '../../assets/somDeLogin.mp3';
import { SoundProvider } from "../components/SoundContext.js"; // Caminho do contexto
import CelestialSound from '../../assets/CelestialSound.mp3';
import DarkSound from '../../assets/DarkSound.mp3';


const TelaDeLogin = ({ navigation }) => {
  const { currentTheme } = useContext(ThemeContext); // Pegando o tema atual
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState('');
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const { textoLinkLogin, botaoEnviarMemoriaCor, bordaContainerComponente, bordaContainerComponente2, dataMensagemMemoriaTextoCor } = currentTheme;


  // Função para tocar o som
  const playSoundOnFocus = async () => {
    const { sound } = await Audio.Sound.createAsync(CelestialSound);
    await sound.playAsync();
  };

  useEffect(() => {
    // Animação de spring para criar o efeito de bounce
    Animated.spring(scaleAnim, {
      toValue: 1,         // Valor final da escala
      friction: 3,        // Menor friction = mais bounce
      tension: 40,        // Tensão da mola
      useNativeDriver: true,
    }).start();
  }, []);

  const playSoundLogin = async () => {
    const { sound } = await Audio.Sound.createAsync(somDeLogin);
    await sound.playAsync();
  };

  const playSoundLoginStart = async () => {
    const { sound } = await Audio.Sound.createAsync(DarkSound);
    await sound.playAsync();
  };

  const handleLogin = async () => {
    if (!userID || !password) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    try {
      setLoading(true);
      const user = await loginUser(userID, password);
      console.log('Usuário logado:', user);
      
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      
      await playSoundLogin();  // 🔊 Toca o som antes de mudar de tela
      navigation.replace('TelaPrincipal'); // Navega após o som tocar
      
    } catch (error) {
      Alert.alert('Erro no login', error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendPassword = async () => {
    try {
      const response = await fetch('http://seu-servidor.com/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userID,  // Envia o e-mail que o usuário forneceu
          senha: password, // Envia a senha (ou código) que o usuário forneceu
        }),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'O código foi enviado para o seu e-mail!');
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o código. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar o e-mail.');
    }
  };

  return (
    <SoundProvider>
      <Animated.View style={[styles.container, { backgroundColor: currentTheme.background, transform: [{ scale: scaleAnim }] }]}> 
        <Image source={currentTheme.Icone0} style={styles.logo} />
       
        {/* TextInput para o campo de login com borda e fundo personalizados */}
        <TextInput
          style={[styles.input, { 
            width:'70%',
            borderColor: currentTheme.borderbutton, // Cor da borda da caixa
            backgroundColor: currentTheme.button, // Cor do fundo da caixa
            borderWidth: 1.5,  // Largura da borda
            color: currentTheme.text2,  // Cor do texto dentro do TextInput
            padding: 10, // Padding para dentro da caixa
            borderRadius: 5, // Arredondar os cantos da caixa, se quiser
            textAlign:"center",
            margin:10
          }]}
          placeholder="Player"
          placeholderTextColor={currentTheme.placeholder} // Cor do placeholder
          value={userID}
          onChangeText={setUserID}
          onFocus={playSoundOnFocus} // Toca o som quando o campo for selecionado
        />

        {/* TextInput para o campo de senha */}
        <TextInput
          style={[styles.input, { 
            width:'70%',
            borderColor: currentTheme.borderbutton, // Cor da borda da caixa
            backgroundColor: currentTheme.button, // Cor do fundo da caixa
            borderWidth: 1.5,  // Largura da borda
            color: currentTheme.text2,  // Cor do texto dentro do TextInput
            padding: 10, // Padding para dentro da caixa
            borderRadius: 5, // Arredondar os cantos da caixa, se quiser
            textAlign:"center",
            margin:'10'
          }]}
          placeholder="Código"
          secureTextEntry
          placeholderTextColor={currentTheme.placeholder} // Cor do placeholder
          value={password}
          onChangeText={setPassword}
          onFocus={playSoundOnFocus} // Toca o som quando o campo for selecionado
        />

        {/* Botão de login */}
        <TouchableOpacity 
  onPress={() => {
    playSoundLoginStart();
    handleLogin();  // Chamando a função handleLogin
  }} 
  style={[styles.buttonLogin, { backgroundColor: currentTheme.button, borderColor: currentTheme.borderbutton, borderWidth: 1.5, marginTop: 30 }]}> 
  <Text style={[styles.buttonText, { color: '#202020' }]}>Start</Text>
</TouchableOpacity>


        {/* Botão para acessar código */}
        <TouchableOpacity onPress={sendPassword}>
          <Text style={[styles.link, { color:textoLinkLogin }]}>Acessar Código</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={[styles.link, { color: textoLinkLogin }]}>Registrar-se</Text>
        </TouchableOpacity>
      </Animated.View>
    </SoundProvider>
  );
};

export default TelaDeLogin;

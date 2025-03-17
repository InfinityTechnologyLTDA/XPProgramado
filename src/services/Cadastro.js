import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase.js';
import { ThemeContext } from '../context/ThemeContext'; // Tema
import styles from '../components/style'; // Estilos

const Cadastro = ({ navigation }) => {
  const { currentTheme } = useContext(ThemeContext); // Obtém o tema atual
  const [email, setEmail] = useState(''); // <- Email do usuário
  const [password, setPassword] = useState(''); // <- Senha

  const handleCadastro = async () => {
    if (!email || !password) { // Verifica se os campos estão vazios
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Sucesso", "Cadastro realizado!");
      navigation.navigate("TeladeLogin");
    } catch (error) {
      Alert.alert("Erro ao cadastrar", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <TouchableOpacity style={[styles.link]}>
        <Text style={[styles.linkText, { color: currentTheme.alerts, margin: 30 }]}>
          Player = Email, use um existente!
        </Text>
      </TouchableOpacity>

      {/* Campo de E-mail */}
      <TextInput
        style={[styles.input, {
          width: '70%',
          borderColor: currentTheme.borderbutton,
          backgroundColor: currentTheme.button,
          borderWidth: 1.5,
          color: currentTheme.text2,
          padding: 10,
          borderRadius: 10,
          textAlign: "center",
          margin: 10,
        }]}
        placeholder="Player"
        placeholderTextColor={currentTheme.placeholder}
        value={email}
        onChangeText={setEmail} // Alterando de 'setUserID' para 'setEmail'
      />

      {/* Campo de Senha */}
      <TextInput
        style={[styles.input, {
          width: '70%',
          borderColor: currentTheme.borderbutton,
          backgroundColor: currentTheme.button,
          borderWidth: 1.5,
          color: currentTheme.text2,
          padding: 10,
          borderRadius: 10,
          textAlign: "center",
          margin: 10,
        }]}
        placeholder="Código"
        secureTextEntry
        placeholderTextColor={currentTheme.placeholder}
        value={password}
        onChangeText={setPassword}
      />

<TouchableOpacity style={[styles.link, {color: currentTheme.alerts}]}>
        <Text style={[styles.linkText, { color: currentTheme.alerts, margin: 30 }]}>
          Código = senha, mínimo 6 digitos
        </Text>
      </TouchableOpacity>

      {/* Botão de Cadastro */}
      <TouchableOpacity 
        onPress={handleCadastro} 
        style={[styles.buttonLogin, { backgroundColor: currentTheme.button, borderColor: currentTheme.borderbutton, borderWidth: 1.5, marginTop: 30 }]}
      > 
        <Text style={[styles.buttonText, { color: currentTheme.tertiary }]}>Gravar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Cadastro;

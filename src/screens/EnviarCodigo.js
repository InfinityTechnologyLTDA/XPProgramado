import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import styles from '../components/style'; // Importando os estilos do style.js

const EnviarCodigo = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const sendPassword = async () => {
    try {
      const response = await fetch('http://seu-servidor.com/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // Envia o e-mail fornecido
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'O código foi enviado para o seu e-mail!');
        navigation.goBack(); // Retorna para a tela anterior (Tela de Login)
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o código. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar o e-mail. Verifique sua conexão.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Insira seu E-mail</Text>

      {/* Input para o e-mail */}
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Botão para enviar o código */}
      <TouchableOpacity onPress={sendPassword} style={styles.button}>
        <Text style={styles.buttonText}>Enviar Código</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EnviarCodigo;

import React, { useState, useContext, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, Dimensions, Platform } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';


const AdicionarTarefaAprimoramento = ({ onAdicionarTarefaAprimoramento, aprimoramentoCount }) => {
  const [novoAprimoramento, setNovoAprimoramento] = useState('');
  const { currentTheme } = useContext(ThemeContext);
  const [horario, setHorario] = useState('');
  const [mostrarSeletorHorario, setMostrarSeletorHorario] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState('06:00'); // Valor inicial para evitar erro
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const { text, text2, border, botaoAprimoramento, botaoEstudos, botaoTarefas, backgroundContainer, textTitulos, sinaldeMais, textTitulos2, botaoEnviarMemoriaCor, botaoplustarefa, textHolder, buttonTextInput } = currentTheme;
  const { width, height } = Dimensions.get('window');

  // Lista de horários disponíveis
  const horariosDisponiveis = [
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00'
  ];

  // Quando a pessoa clica em "Adicionar", mostra o seletor de horário
  const iniciarAdicionarAprimoramento = () => {
    if (novoAprimoramento.trim() === '') {
      alert('Digite uma tarefa antes de prosseguir!');
      return;
    }
    setMostrarSeletorHorario(true);
    validarHorario(true);
  };

  // Confirmação final: adiciona a tarefa com o horário selecionado
  const confirmarAdicionarAprimoramento = () => {
    if (!novoAprimoramento.trim()) {
      alert('A tarefa não pode estar vazia!');
      return;
    }
    // Verifica se o limite de 3 aprimoramentos foi atingido
    if (aprimoramentoCount >= 3) {
      setMostrarAviso(true);
      setTimeout(() => setMostrarAviso(false), 3000);
      return;
    }
    onAdicionarTarefaAprimoramento(novoAprimoramento, horarioSelecionado);
    setNovoAprimoramento('');
    setMostrarSeletorHorario(false);
  };

  const validarHorario = (input) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Formato 00:00 até 23:59
    return regex.test(input);
  };




// Função para tocar o som baseado no tema selecionado
 const playSoundEnviarA = async () => {
  try {
    const soundFile = notificaçaoASounds[currentTheme.name] || notificaçaoASounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const notificaçaoASounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somNotificaçao3.mp3'), // Som padrão
};









  return (
    <View style={{ padding: 10, position:'relative', justifyContent:'center', alignItems:'center', flexDirection:'column', alignContent:'center'}}>
      {/* Campo para a tarefa */}
    

      <TextInput
        style={{
          borderWidth: 1,
          borderColor: text,
          padding: 7,
          color: botaoplustarefa,
          borderRadius: 5,
          alignItems:'center',
          alignSelf:'center',
          fontWeight:'500',
          margin:10,
          borderWidth: 1.5, borderTopWidth:0.3 ,borderRadius: 5 ,
        }}
        placeholder="Defina um aprimoramento"
        placeholderTextColor={textHolder}
        value={novoAprimoramento}
        onChangeText={setNovoAprimoramento}
      />

      {/* Botão para abrir o seletor de horário */}
      {!mostrarSeletorHorario && (
        <TouchableOpacity
          onPress={iniciarAdicionarAprimoramento}
          style={{
            position:'relative',
            backgroundColor: botaoEnviarMemoriaCor,
            padding: 6,
            borderRadius: 5,
            alignItems: 'center',
            top: width * 0.03,
            borderWidth:2,
            borderBottomWidth:2
          }}
        >
          <Text style={{ color: 'black', textAlign: 'center',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontSize:14, paddingLeft:10, paddingRight:10,  textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
                        textShadowOffset: { width: 0, height: 0 }, 
                        textShadowRadius: 3,}}>Programar</Text>
        </TouchableOpacity>
      )}

      {/* Seletor de horário (aparece após clicar em "Adicionar") */}
      {mostrarSeletorHorario && (
        <View style={{ marginTop: 10, }}>
       

          {/* Botão de confirmação */}
          <TouchableOpacity
            onPress={()=> {
              
              confirmarAdicionarAprimoramento();
              playSoundEnviarA();
            
            }}
           style={{
                         backgroundColor: text,
                        padding: 6,
                       borderRadius: 5,
                       alignItems: 'center',
                       top: width * 0.01,
                       borderWidth:2,
                       borderBottomWidth:0.1,
                       }}
                     >
                       <Text style={{ color: 'black', textAlign: 'center',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontSize:14, paddingLeft:10, paddingRight:10,  textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
                                               textShadowOffset: { width: 0, height: 0 }, 
                                               textShadowRadius: 3, }}>Confirmar</Text>
          </TouchableOpacity>

          {/* Mensagem de limite atingido */}
          {mostrarAviso && (
            <Text style={{ color: 'black', textAlign: 'center',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontSize:14,  textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
              textShadowOffset: { width: 0, height: 0 }, 
              textShadowRadius: 3, top: width * 0.05}}>
              ❕ Capacidade Máxima ❕
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default AdicionarTarefaAprimoramento;

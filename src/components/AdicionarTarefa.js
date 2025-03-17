import React, { useState, useContext, } from 'react';
import { View, TextInput, TouchableOpacity, Text, Dimensions, Platform } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';



const AdicionarTarefa = ({ onAdicionarTarefa }) => {
  const [novaTarefa, setNovaTarefa] = useState('');
  const { currentTheme } = useContext(ThemeContext);
  const [horario, setHorario] = useState('');
  const [mostrarSeletorHorario, setMostrarSeletorHorario] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState('06:00'); // Valor inicial para evitar erro
  const { text, text2, border, botaoAprimoramento, botaoEstudos, botaoTarefas, backgroundContainer, textTitulos, sinaldeMais, textTitulos2, botaoEnviarMemoriaCor, botaoplustarefa, textHolder, buttonTextInput} = currentTheme;


    const { width, height } = Dimensions.get('window');
  

  const adicionarNovaTarefa = (nomeTarefa, horario) => {
    if (tarefasEstudo.length >= LIMITE_TAREFAS) return;
  
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid; 
    if (!userId) return; 
  
    const tarefasRef = ref(db, `usuarios/${userId}/tarefasEstudo`);
    const novaTarefaRef = push(tarefasRef);
  
    const novaTarefa = {
      id: novaTarefaRef.key,
      nome: nomeTarefa,
      xp: 3,
      horario: horario,
      concluido: false,
    };
  
    set(novaTarefaRef, novaTarefa);
  };

  // Lista de horários disponíveis
  const horariosDisponiveis = [
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00'
  ];

  // Quando a pessoa clica em "Adicionar", mostra o seletor de horário
  const iniciarAdicionarTarefa = () => {
    if (novaTarefa.trim() === '') {
      alert('Digite um novo Hábito antes de prosseguir!');
      return;
    }
    setMostrarSeletorHorario(true);
    validarHorario(true);
  };

 // Confirmação final: adiciona a tarefa com o horário selecionado
 const confirmarAdicionarTarefa = () => {
  if (!novaTarefa.trim()) {
    alert('O Hábito não pode estar vazia!');
    return;
  }

  onAdicionarTarefa(novaTarefa, horarioSelecionado);
  setNovaTarefa('');
  setMostrarSeletorHorario(false);
};

  const validarHorario = (input) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Formato 00:00 até 23:59
    return regex.test(input);
  };


// Função para tocar o som baseado no tema selecionado
 const playSoundEnviarR = async () => {
  try {
    const soundFile = enviarRSounds[currentTheme.name] || enviarRSounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const enviarRSounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somNotificaçao3.mp3'), // Som padrão
};


  return (
    <View style={{ padding: 10, position:'relative', justifyContent:'center', alignItems:'center', flexDirection:'column', alignContent:'center', }}>
      {/* Campo para a tarefa */}
      <TextInput
        style={{
          borderWidth: 2,
          borderColor: text,
          padding: 7,
          color: botaoplustarefa,
          borderRadius: 5,
          alignItems:'center',
          alignSelf:'center',
          fontWeight:'500',
          borderWidth: 1.5, borderTopWidth:0.3 ,borderRadius: 5 ,
          margin:10,
          
          

        }}
        placeholder="Digite uma novo Hábito"
        placeholderTextColor={textHolder}
        value={novaTarefa}
        onChangeText={setNovaTarefa}
      />
<View>
      {/* Botão para abrir o seletor de horário */}
      {!mostrarSeletorHorario && (
        <TouchableOpacity
          onPress={iniciarAdicionarTarefa}
          style={{
            position:'relative',
            backgroundColor: botaoEnviarMemoriaCor,
            padding: 6,
            alignItems: 'center',
            top:width*0.03,
            borderWidth:2,
            borderBottomWidth:2,
            borderRadius:5
          }}
        >
          <Text style={{ color: 'black', textAlign: 'center',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontSize:14, paddingLeft:10, paddingRight:10,  textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
              textShadowOffset: { width: 0, height: 0 }, // Direção da sombra
              textShadowRadius: 3,}}>Programar</Text>
        </TouchableOpacity>
      )}
</View>
      {/* Seletor de horário (aparece após clicar em "Adicionar") */}
      {mostrarSeletorHorario && (
        <View style={{ marginTop: 10,  }}>
          <Text style={{ color: 'black', textAlign: 'center',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontSize:14, paddingLeft:10, paddingRight:10,  textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
                                  textShadowOffset: { width: 0, height: 0 }, 
                                  textShadowRadius: 3, }}>Escolha um horário:</Text>
          <Picker
            selectedValue={horarioSelecionado}
            onValueChange={(itemValue) => setHorarioSelecionado(itemValue)}
            style={{ width: 150, color: text, textAlign: 'center',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontSize:14, paddingLeft:10, paddingRight:10,  textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
              textShadowOffset: { width: 0, height: 0 }, 
              textShadowRadius: 3,  }}
          >
            {horariosDisponiveis.map((horario, index) => (
              <Picker.Item key={index} label={horario} value={horario} />
            ))}
          </Picker>

          {/* Botão de confirmação */}
          <TouchableOpacity
            onPress={() =>  {
              confirmarAdicionarTarefa();
              playSoundEnviarR();
            }}
            style={{
              backgroundColor: 'white',
             padding: 6,
            borderRadius: 5,
            alignItems: 'center',
            top: width * 0.02,
            borderWidth:2,
            borderBottomWidth:0.1
            }}
          >
            <Text style={{ color: 'black', textAlign: 'center',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontSize:14, paddingLeft:10, paddingRight:10,  textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
                                    textShadowOffset: { width: 0, height: 0 }, 
                                    textShadowRadius: 3, }}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default AdicionarTarefa;

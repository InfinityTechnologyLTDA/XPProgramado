import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, StyleSheet, Dimensions, Animated, ScrollView, Platform, Easing  } from 'react-native';
import { getDatabase, ref, onValue, push, set, get, remove } from 'firebase/database';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ThemeContext } from '../context/ThemeContext.js';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';


const TeladeProgramacao = ({ initialXP = 0, initialLevel = 1 }) => {
  const [programacaoAgenda, setProgramacaoAgenda] = useState([]);
  const [eventTime, setEventTime] = useState('06:00');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventName, setEventName] = useState('');
  const { currentTheme } = useContext(ThemeContext);
  const { width, height } = Dimensions.get('window');
  const { backgroundContainer2, botaoEnviarMemoriaCor, bordaContainerComponente, bordaContainerComponente2 } = currentTheme;
  const MAX_LEVEL = 500;
  const XP_TO_NEXT_LEVEL = 500;
  const [xp, setXp] = useState(initialXP);
  const [level, setLevel] = useState(initialLevel);
  const [xpNeeded, setXpNeeded] = useState(XP_TO_NEXT_LEVEL);
  const db = getDatabase();
  const formattedDate = format(selectedDate, 'yyyy-MM-dd', { locale: ptBR });
  const progress = useRef(new Animated.Value(0)).current;
  const [showPicker, setShowPicker] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventColor, setEventColor] = useState('green'); // cor padrão



  const fadeAnim = useRef(new Animated.Value(0)).current; // Começa invisível
// Função para o efeito de Fade In (Aparecer)
const fadeIn = () => {
  Animated.timing(fadeAnim, {
    toValue: 1, // Opacidade total
    duration: 400, // Tempo da animação
    easing: Easing.ease,
    useNativeDriver: true,
  }).start();
};

// Função para o efeito de Fade Out (Desaparecer)
const fadeOut = () => {
  Animated.timing(fadeAnim, {
    toValue: 0, // Opacidade zero
    duration: 400,
    easing: Easing.ease,
    useNativeDriver: true,
  }).start();
};

// Dispara o Fade In automaticamente quando o componente é montado
useEffect(() => {
  fadeIn(); // Animação de entrada

  return () => {
    fadeOut(); // Animação de saída ao desmontar
  };
}, []);


  const availableTimes = [
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00'
  ];

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const eventsRef = ref(db, `usuarios/${userId}/programacaoAgenda/${formattedDate}`);
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      setEvents(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });
    return () => unsubscribe();
  }, [selectedDate, formattedDate]);
  

  const removeEvent = async (eventId) => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const eventRef = ref(db, `usuarios/${userId}/programacaoAgenda/${formattedDate}/${eventId}`);
      await remove(eventRef);
      console.log("Evento removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover o evento:", error);
    }
  };
  

  const saveXPToFirebase = async (userId, xp, level) => {
    try {
      const db = getDatabase();
      await set(ref(db, `usuarios/${userId}/xp`), xp);
      await set(ref(db, `usuarios/${userId}/level`), level);
      console.log("XP e nível salvos no Firebase!");
    } catch (error) {
      console.error("Erro ao salvar XP no Firebase:", error);
    }
  };

  const loadXPFromFirebase = async (userId) => {
    try {
      const db = getDatabase();
      const snapshot = await get(ref(db, `usuarios/${userId}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return { xp: data.xp || 0, level: data.level || 1 };
      } else {
        console.log("Nenhum dado encontrado no Firebase.");
        return { xp: 0, level: 1 };
      }
    } catch (error) {
      console.error("Erro ao carregar XP do Firebase:", error);
      return { xp: 0, level: 1 };
    }
  };

  const removeXPFromFirebase = async (userId, xpToRemove) => {
    try {
      const db = getDatabase();
      const xpRef = ref(db, `usuarios/${userId}/xp`);
      const snapshot = await get(xpRef);
      let currentXP = snapshot.exists() ? snapshot.val() : 0;
      const newXP = Math.max(0, currentXP - xpToRemove);
      await set(xpRef, newXP);
      console.log(`XP atualizado: ${newXP}`);
    } catch (error) {
      console.error("Erro ao remover XP do Firebase:", error);
    }
  };

// Este useEffect adiciona XP automaticamente quando o XP alcança o limite e sobe de nível.
useEffect(() => {
  if (xp >= xpNeeded) {
    const newLevel = level + 1;
    const newXpNeeded = xpNeeded ; // Incremento de 300 a cada level up novo
    setLevel(newLevel);
    setXpNeeded(newXpNeeded);
    setXp(0);
  }
}, [xp]);

  useEffect(() => {
    const checkDate = async () => {
      try {
        const lastCheckedDate = await AsyncStorage.getItem('lastCheckedDate');
        const today = new Date().toLocaleDateString();
        if (lastCheckedDate === today) {
          setChecked(true);
        }
      } catch (error) {
        console.error('Erro ao acessar o AsyncStorage', error);
      }
    };
    checkDate();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const loadData = async () => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        const { xp, level } = await loadXPFromFirebase(userId);
        setXp(xp);
        setLevel(level);
      };
      loadData();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (xp >= xpNeeded) {
      const newLevel = level + 1;
      const newXpNeeded = xpNeeded;
      setLevel(newLevel);
      setXpNeeded(newXpNeeded);
      setXp(0);
    }
  }, [xp]);

  const addEvent = async () => {
    if (!eventName.trim()) return;
    if (events.length >= 3) {
      alert("Limite de 3 programações por dia atingido.");
      return;
    }
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("Usuário não autenticado!");
      return;
    }
    const newEvent = { 
      name: eventName, 
      date: formattedDate, 
      horario: eventTime, 
      cor: eventColor 
    };
    console.log("Tentando adicionar evento para o usuário:", userId, "na data:", formattedDate);
    console.log("Novo evento:", newEvent);
    try {
      // Salva no nó do usuário, agrupado pela data
      await push(ref(db, `usuarios/${userId}/programacaoAgenda/${formattedDate}`), newEvent);
      console.log("Evento adicionado com sucesso!");
      await addXP(30);
      setEventName('');
      setModalVisible(false);
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
    }
  };
  
  
  
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const addXP = async (amount) => {
    console.log(`Tentando adicionar XP: ${amount}`);
    let newXP = xp + amount;
    let newLevel = level;
    let newXpNeeded = xpNeeded;
    while (newXP >= newXpNeeded && newLevel < MAX_LEVEL) {
      newXP -= newXpNeeded;
      newLevel++;
      newXpNeeded += 300;
    }
    if (newLevel >= MAX_LEVEL) {
      newLevel = MAX_LEVEL;
      newXP = 0;
    }
    console.log(`Novo XP: ${newXP}, Novo Nível: ${newLevel}, XP Necessário: ${newXpNeeded}`);
    await AsyncStorage.setItem("xp", newXP.toString());
    await AsyncStorage.setItem("level", newLevel.toString());
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
        await saveXPToFirebase(userId, newXP, newLevel);
    setXp(newXP);
    setLevel(newLevel);
    setXpNeeded(newXpNeeded);
    console.log("XP atualizado com sucesso!");
  };

  useEffect(() => {
    AsyncStorage.setItem("xp", xp.toString());
    AsyncStorage.setItem("level", level.toString());
  }, [xp, level]);

  useEffect(() => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (userId) {
      const programacaoRef = ref(db, `usuarios/${userId}/programacaoAgenda`);
      onValue(programacaoRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const programacaoArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setProgramacaoAgenda(programacaoArray);
        } else {
          console.log("Nenhum aprimoramento encontrado.");
        }
      });
    }
  }, []);

  const toggleTarefa = (id) => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const programacaoIndex = programacaoAgenda.findIndex(
      (programacao) => programacao.id === id
    );
    if (programacaoIndex === -1) return;
    if (programacaoAgenda[programacaoIndex].concluido) return;
    const novaLista = [...programacaoAgenda];
    novaLista[programacaoIndex].concluido = true;
    setProgramacaoAgenda(novaLista);
    const programacaoRef = ref(db, `usuarios/${userId}/programacaoAgenda/${id}`);
    addXP(30);
    set(programacaoRef, novaLista[programacaoIndex]);
  };


  const [sortedEvents, setSortedEvents] = useState([]);

// Ordena os eventos sempre que o array "events" mudar
useEffect(() => {
  const sorted = events.slice().sort((a, b) => a.horario.localeCompare(b.horario));
  setSortedEvents(sorted);
}, [events]);




 // Função para tocar o som baseado no tema selecionado
 const playSoundEnviarP = async () => {
  try {
    const soundFile = notificaçaoSounds[currentTheme.name] || notificaçaoSounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const notificaçaoSounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somNotificaçao3.mp3'), // Som padrão
};




 // Função para tocar o som baseado no tema selecionado
 const playSoundSelecionarDia = async () => {
  try {
    const soundFile = selecionarDiaSounds[currentTheme.name] || selecionarDiaSounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const selecionarDiaSounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/WhiteSound.mp3'), // Som padrão
};



 // Função para tocar o som baseado no tema selecionado
 const playSoundSelecionarMes = async () => {
  try {
    const soundFile = selecionarMesSounds[currentTheme.name] || selecionarMesSounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const selecionarMesSounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somTransiçao1.mp3'), // Som padrão
};




 // Função para tocar o som baseado no tema selecionado
 const playSoundExcluirP = async () => {
  try {
    const soundFile = excluirSounds[currentTheme.name] || excluirSounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const excluirSounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somdeExcluir.mp3'), // Som padrão
};


  return (
    <Animated.View style={{ backgroundColor: backgroundContainer2, top: width * 0.005, width: width * 0.96, height: height * 0.93, borderWidth: 2, borderColor: bordaContainerComponente, alignSelf: 'center', borderRadius: 5, padding: 10 ,       borderLeftColor: bordaContainerComponente2,
      borderRightColor: bordaContainerComponente2,
      borderBottomColor: 'gray',
      borderRightWidth: 2,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      borderTopWidth:0,
      borderTopColor:bordaContainerComponente2,
      opacity: fadeAnim,
      }}>
      <View style={[styles.backgroundContainer, { width: width * 0.87, height: height * 0.5, position: 'absolute', borderWidth: 2, justifyContent: 'center', alignSelf: 'center', borderRadius: 25, padding: 0, borderTopColor: 'transparent', borderTopWidth: 0, marginTop: 15 ,  }]}>
        <ScrollView style={{ }}>
          <BlurView style={{ borderRadius: 10, overflow: 'hidden',  backgroundColor: 'transparent', borderLeftColor: bordaContainerComponente2, borderRightColor: bordaContainerComponente2, borderBottomColor: 'gray', borderRightWidth: 2, borderLeftWidth: 2, borderBottomWidth: 2 }}>
            <View style={styles.header}>


              <TouchableOpacity onPress={() => 
              
            {  setCurrentMonth(subMonths(currentMonth, 1));
              playSoundSelecionarMes();}


              }>
                <Text style={[styles.navButton, { padding: 10, top:-width*0.008 }]}>{'⇚'}</Text>
              </TouchableOpacity>


              <Text style={styles.monthText}>{format(currentMonth, "MMMM yyyy", { locale: ptBR, fontSize: 10 })}</Text>


              <TouchableOpacity onPress={() => 
              
            {  setCurrentMonth(addMonths(currentMonth, 1));
              playSoundSelecionarMes();}


              }>
              
                <Text style={[styles.navButton, { padding: 10, top:-width*0.008 }]}>{'⇛'}</Text>
              </TouchableOpacity>


            </View>


            <View style={styles.calendar}>
              {daysInMonth.map((day) => (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.day, selectedDate.toDateString() === day.toDateString() && styles.selectedDay]} 
                  onPress={() => {
                    setSelectedDate(day);
                    playSoundSelecionarDia();}
                  }
                >
                  <Text>{format(day, 'd')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Animated.View style={styles.containerButton}>
              <TouchableOpacity 
              onPress={() => {
                setModalVisible(true)
                playSoundEnviarP();
              }}

                style={[styles.addButton, {backgroundColor:botaoEnviarMemoriaCor}]}>
                <Text style={styles.addButtonText}>Programar</Text>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.selectedDateText}>Eventos em {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}:</Text>
            / Renderização única:
<FlatList
  data={sortedEvents}
  keyExtractor={(item) => item.id.toString()} // Certifica-se de que cada evento tem uma key única
  renderItem={({ item }) => (
    <View style={{ marginVertical: 10, alignSelf: 'center' }}>
      <TouchableOpacity
        onLongPress={() =>
          setEventToDelete((prev) => (prev === item.id ? null : item.id))
        }
      >
        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <View style={[styles.priorityDot, { backgroundColor: item.cor }]} />
          <Text style={styles.eventItem2}>{item.horario}</Text>
          <Text style={styles.eventItem}>{item.name}</Text>
        </View>
      </TouchableOpacity>
      {eventToDelete === item.id && (
        <TouchableOpacity
          delayLongPress={200}
          onPress={() => {
            removeEvent(item.id);
            setEventToDelete(null);
            playSoundExcluirP();
          }}
          style={{ marginTop: 5, alignSelf: 'center', flexDirection: 'row' }}
        >
          <Text style={{ color: 'pink', fontSize: 18, }}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  )}
/>


            <Modal visible={modalVisible} transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <TextInput
                    placeholder='Nome do evento'
                    value={eventName}
                    onChangeText={(text) => {
                      setEventName(text);
                      if (text.trim() === '') setShowPicker(false);
                    }}
                    style={styles.input}
                  />
                  {/* Seletor de prioridade */}
                  <View style={styles.colorSelector}>
                  <TouchableOpacity onPress={() => setEventColor('#3ee3f3')} style={[styles.colorOption, { backgroundColor: '#3ee3f3', borderWidth: eventColor === '#3ee3f3' ? 2 : 0 }]}>
                      <Text style={styles.colorOptionText2}>Dispensável</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEventColor('#C0C0C0')} style={[styles.colorOption, { backgroundColor: '#C0C0C0', borderWidth: eventColor === '#C0C0C0' ? 2 : 0 }]}>
                      <Text style={styles.colorOptionText2}>Neutro</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEventColor('#202020')} style={[styles.colorOption, { backgroundColor: '#202020', borderWidth: eventColor === '#202020' ? 2 : 0 }]}>
                      <Text style={styles.colorOptionText}>Importante</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEventColor('#FF3EB5')} style={[styles.colorOption, { backgroundColor: '#FF3EB5', borderWidth: eventColor === '#FF3EB5' ? 2 : 0 }]}>
                      <Text style={styles.colorOptionText}>Crítico</Text>
                    </TouchableOpacity>
                  </View>
                  {eventName.trim() !== '' && !showPicker && (
                    <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.selectTimeButton}>
                      <Text style={{ color: '#000' }}>Selecionar Horário</Text>
                    </TouchableOpacity>
                  )}
                  {showPicker && (
                    <Picker
                      selectedValue={eventTime}
                      onValueChange={(itemValue) => setEventTime(itemValue)}
                      style={styles.pickerStyle}
                    >
                      {availableTimes.map((time, index) => (
                        <Picker.Item  key={index} label={time} value={time} />
                      ))}
                    </Picker>
                  )}
                  <TouchableOpacity 
                  
                  onPress={() => {
                    addEvent();                
                    playSoundEnviarP();
                  }} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelButton}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </BlurView>
        
        </ScrollView>
       

      </View>
      
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, position: 'absolute' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 10, marginRight: 10 },
  navButton: { fontSize: 20, fontWeight: 'bold',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', color:'white',  textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
    textShadowOffset: { width: 2, height: 2 }, // Direção da sombra
    textShadowRadius: 3, // Intensidade do desfoque
  },
  monthText: { fontSize: 20, fontWeight: 'bold',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', color:'white',  textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
    textShadowOffset: { width: 2, height: 2 }, // Direção da sombra
    textShadowRadius: 3, // Intensidade do desfoque
  },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10, alignSelf: 'center', marginLeft: 20, marginRight: 20, alignItems:'center', justifyContent:'center' },
  day: { width: 35, height: 35, justifyContent: 'center', alignItems: 'center', margin: 5, borderWidth: 1.5, borderTopWidth:0.3 ,borderRadius: 10 ,     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  selectedDay: { backgroundColor: '#3ee3f3',  },
  selectedDateText: { fontWeight: 'bold', textAlign: 'center' ,      fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontSize:14, margin:10,  padding:10, textShadowColor: 'rgba(256, 256, 256, 1)', // Cor da sombra
    textShadowOffset: { width: 0, height: 0 }, 
    textShadowRadius: 3, 
  },
  containerButton: { top:0, width:"50%", height:'auto', alignSelf:'center' },
  eventItem: { padding: 5, borderBottomWidth: 1, marginLeft: 10, marginRight: 10, textAlign:'center', borderLeftWidth:1, borderRightWidth:1 , textAlign:'center', alignSelf:'center', alignItems:'center', borderRadius:5, borderTopStartRadius:1},
  eventItem2: { padding: 5, borderBottomWidth: 0.5, marginLeft: 10, marginRight: 10,borderLeftWidth:1, borderRightWidth:1 , borderTopEndRadius:1, textAlign:'center', alignSelf:'center', alignItems:'center', borderRadius:10, borderTopLeftRadius:25, borderTopRightRadius:25  },
  addButton: { backgroundColor: '#3ee3f3', borderTopWidth:2, borderLeftWidth:2, borderRightWidth:2, padding:6, margin:10, borderBottomWidth:2, borderRadius:5},
  addButtonText: { color: 'black', textAlign: 'center',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontSize:14,   textShadowColor: 'rgba(0, 0, 0, 0.75)', // Cor da sombra
    textShadowOffset: { width: 0, height: 0 }, // Direção da sombra
    textShadowRadius: 3, // Intensidade do desfoque
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: 'white', padding: 40, borderRadius: 10, width: '85%', alignSelf:'center', top:20 },
  input: { borderBottomWidth: 1, marginVertical: 10 , alignSelf:'center', textAlign:'center', borderWidth: 1.5, borderTopWidth:0.3 ,borderRadius: 5 , padding:6, fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif' },
  saveButton: { backgroundColor: 'transparent',   marginHorizontal:70, borderTopWidth:2, borderLeftWidth:2,  marginTop:10, borderBottomWidth:0.5, borderRightWidth:2 },
  saveButtonText: { color: 'black', textAlign: 'center',     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', 
  fontSize:14 },
  cancelButton: { color: 'black', textAlign: 'center',  borderWidth:2, marginHorizontal:70, borderTopWidth:2, borderLeftWidth:2, marginTop:10, borderBottomWidth:0.5, },
  selectTimeButton: { backgroundColor: 'transparent', padding: 10, borderRadius: 10, marginBottom: 10, alignItems: 'center',  },
  pickerStyle: { width: '80%', alignSelf:'center', textAlign:'center', alignItems:'center' },
  colorSelector: { flexDirection: 'column', justifyContent: 'center', marginHorizontal:30,},
  colorOption: { padding: 10, borderRadius: 5, margin:10},
  colorOptionText: { color: 'white', fontWeight: 'bold' , textAlign:'center', fontSize:14,     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  colorOptionText2: { color: 'black', fontWeight: 'bold' , textAlign:'center', fontSize:14,     fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  priorityDot: { width: 10, height: 10, borderRadius: 5, alignSelf:'center' }
});

export default TeladeProgramacao;

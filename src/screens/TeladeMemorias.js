import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, Animated, Dimensions, Platform, Easing } from "react-native";
import { getAuth } from "firebase/auth"; 
import { getDatabase, ref, push, set, onValue, get, remove } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { ThemeContext } from '../context/ThemeContext.js';
import { Audio } from 'expo-av';
import DarkSound from '../../assets/DarkSound.mp3';
import WhiteSound from '../../assets/WhiteSound.mp3';
import CelestialSound from '../../assets/CelestialSound.mp3';
import PinkSound from '../../assets/PinkSound.mp3';
import UnicornioSound from '../../assets/UnicornioSound.mp3';
import sounds from '../../assets/sounds.mp3';

const TeladeMemorias  = ({ initialXP = 0, initialLevel = 1 }) => {
  
  
  const [mensagem, setMensagem] = useState(""); // texto digitado
  const [memorias, setMemorias] = useState([]);
  const auth = getAuth();
  const db = getDatabase();
  const { width, height } = Dimensions.get("window");
  const MAX_LEVEL = 500; // Máximo de níveis
  const XP_TO_NEXT_LEVEL = 500; // XP necessário para subir de nível
    // Estado para armazenar XP
    const [xp, setXp] = useState(initialXP);
    const [level, setLevel] = useState(initialLevel);
    const [xpNeeded, setXpNeeded] = useState(XP_TO_NEXT_LEVEL);
    const [selectedMemory, setSelectedMemory] = useState(null);
  const { currentTheme } = useContext(ThemeContext);
  const { backgroundContainer2, botaoEnviarMemoriaCor, bordaContainerComponente, bordaContainerComponente2, dataMensagemMemoriaTextoCor } = currentTheme;

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









 // Estado animado para a barra de progresso
 const progress = useRef(new Animated.Value(0)).current;



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



  // Função para carregar XP e nível do Firebase
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







  // UseEffect para carregar XP e nível ao iniciar o app
useEffect(() => {
  const loadData = async () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
          const { xp, level } = await loadXPFromFirebase(userId);
      setXp(xp);
      setLevel(level);
  };
  loadData();
}, []);

// Efeito para animar a barra de progresso
useEffect(() => {
  let newProgress = xp / xpNeeded;
  Animated.timing(progress, {
    toValue: newProgress,
    duration: 500,
    useNativeDriver: false,
  }).start();
}, [xp, xpNeeded]); // Mantendo apenas um efeito


  // Adicionar XP e subir de nível se necessário
  // Modifique a função addXP para salvar no Firebase
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

  // Salvar no AsyncStorage
  await AsyncStorage.setItem("xp", newXP.toString());
  await AsyncStorage.setItem("level", newLevel.toString());

  // Salvar no Firebase
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
    await saveXPToFirebase(userId, newXP, newLevel);

  // Atualizar estados
  setXp(newXP);
  setLevel(newLevel);
  setXpNeeded(newXpNeeded);

  console.log("XP atualizado com sucesso!");
};
  

  // Salvar XP e nível ao mudar
  // Efeito para salvar XP e nível
  useEffect(() => {
    AsyncStorage.setItem("xp", xp.toString());
    AsyncStorage.setItem("level", level.toString());
  }, [xp, level]);





    const deleteMemory = async (memoryId) => {
      try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
                await remove(ref(db, `usuarios/${userId}/memorias/${memoryId}`));
        console.log("Memória apagada!");
      } catch (error) {
        console.error("Erro ao apagar a memória:", error);
      }
      setSelectedMemory(null);
    };
    




// Função para enviar a memória para o Firebase
const enviarMemoria = async () => {
  if (!mensagem || !auth.currentUser) return;
  try {
    const userId = auth.currentUser?.uid;
    const memoriasRef = ref(db, `usuarios/${userId}/memorias`);
    const novaMemoriaRef = push(memoriasRef);

    // Salva a memória no Firebase
    await set(novaMemoriaRef, {
      texto: mensagem,
      timestamp: Date.now(),
    });

    console.log("✅ Memória enviada:", mensagem);
    setMensagem(""); // Limpa o campo após o envio

    // Verificar a data de hoje
    const today = new Date().toLocaleDateString();
    
    // Carregar a data do último envio e o contador de memórias
    const lastSentDateMemorias = await loadLastSentDateFromFirebase(userId);
    let count = await loadMemoryCountFromFirebase(userId);

    // Se for um novo dia, resetar o contador
    if (lastSentDateMemorias !== today) {
      count = 0;  // Resetar contador de memórias
      await saveMemoryCountToFirebase(userId, count);  // Salvar o novo contador
      await saveLastSentDateToFirebase(userId, today);  // Salvar a data de hoje
    }

    // Controle de limite diário: somente as 7 primeiras memórias do dia concedem XP
    if (count < 7) {
      await addXP(20); // Adicionar XP
      count++; // Incrementa o contador de memórias

      // Salvar o novo contador de memórias no Firebase
      await saveMemoryCountToFirebase(userId, count);
    } else {
      console.log("Limite diário de XP atingido (7 memórias).");
    }
  } catch (error) {
    console.error("Erro no envio de memória:", error);
  }
};

// Função para carregar a data do último envio
const loadLastSentDateFromFirebase = async (userId) => {
  const dateRef = ref(db, `usuarios/${userId}/lastSentDateMemorias`);
  const snapshot = await get(dateRef);
  return snapshot.exists() ? snapshot.val() : null;
};

// Função para salvar a data do último envio
const saveLastSentDateToFirebase = async (userId, date) => {
  const dateRef = ref(db, `usuarios/${userId}/lastSentDateMemorias`);
  await set(dateRef, date);  // Salva a data de envio
};


// Função para carregar o contador de memórias
const loadMemoryCountFromFirebase = async (userId) => {
  try {
    const db = getDatabase();
    const snapshot = await get(ref(db, `usuarios/${userId}/memoriasEnviadasHoje`));
    if (snapshot.exists()) {
      return snapshot.val().count;
    } else {
      return 0; // Retorna 0 se não houver dados
    }
  } catch (error) {
    console.error("Erro ao carregar contador de memórias do Firebase:", error);
    return 0;
  }
};

// Função para salvar o contador de memórias
const saveMemoryCountToFirebase = async (userId, count) => {
  const countRef = ref(db, `usuarios/${userId}/memoriasEnviadasHoje`);
  await set(countRef, { count, date: new Date().toLocaleDateString() });
  console.log("Contador de memórias salvo no Firebase!");
};



  
  

useEffect(() => {
  const user = auth.currentUser;
  if (!user) return;
  
  const memoriasRef = ref(db, `usuarios/${user.uid}/memorias`);
  
  const unsubscribe = onValue(memoriasRef, (snapshot) => {
    const novasMemorias = [];
    snapshot.forEach((childSnapshot) => {
      novasMemorias.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });
    // Ordena as memórias por timestamp (mais recentes primeiro)
    novasMemorias.sort((a, b) => b.timestamp - a.timestamp);
    setMemorias(novasMemorias);
    console.log("📩 Memórias carregadas:", novasMemorias.length);
  });
  
  return () => unsubscribe();
}, []);






 // Função para tocar o som baseado no tema selecionado
 const playSoundExcluir = async () => {
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
  default: require('../../assets/somdeExcluir.mp3'), // Som padrão
};



 // Função para tocar o som baseado no tema selecionado
 const playSoundByTheme = async () => {
  try {
    const soundFile = themeSounds[currentTheme.name] || themeSounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const themeSounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somNotificaçao3.mp3'), // Som padrão
};

  return (
    <Animated.View
      style={{
        backgroundColor: "transparent",
        width: width * 0.96,
        height: height * 0.60,
        borderWidth: 2,
        borderColor: bordaContainerComponente,
        alignSelf: "center",
        borderRadius: 5,
        top: width * 0.005,
        borderLeftColor: bordaContainerComponente2,
        borderRightColor: bordaContainerComponente2,
        borderBottomColor: 'gray',
        borderRightWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderTopWidth:0,
        borderTopColor:bordaContainerComponente2,
        opacity: fadeAnim,
      }}
    >

      
<View style={{ margin: 20 , alignItems:'center', borderColor: bordaContainerComponente, 
}}>
       
       <TextInput
         style={{ borderWidth: 1, padding: 10,  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',borderWidth: 1.5, borderTopWidth:0.3 ,borderRadius: 20 , borderColor:bordaContainerComponente2 
         }}
         placeholder="Escreva suas memórias de hoje"
         onChangeText={setMensagem}
         value={mensagem}
       />
       <TouchableOpacity
onPress={async () => {
  await enviarMemoria(); // Sua função original
  await playSoundByTheme(); // Nova função de som
}}      
              style={{marginTop:15 , backgroundColor: botaoEnviarMemoriaCor, padding: 6, alignItems:'center' , borderRadius:5, borderWidth:2, textAlign:'center', alignSelf:'center', alignItems:'center',  borderColor: "bordaContainerComponente", paddingHorizontal:10}}
        >
          <Text style={{ color: "black",  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 1)', // Cor da sombra
    textShadowOffset: { width: 0, height: 0 }, 
    textShadowRadius: 1,
    paddingHorizontal:5,
 }}>Registrar</Text>
        </TouchableOpacity>
       </View>

       {memorias.length === 0 && (
  <View style={{ margin: 20, alignItems: 'center' }}>
    <Text style={{ 
      color: 'white', 
      fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
      fontSize: 20,
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 1)', // Cor da sombra
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3, 
    }}>
      Registre as memórias do seu dia, acontecimentos e como você se sente em relação as coisas e as pessoas.
    </Text>
  </View>
)}



       <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ marginTop: 10, bottom: width * 0.04,  }}>
  <View style={{ margin: 10, alignItems: 'center' }}>
    <BlurView
      style={{
        position: 'relative',
        flexDirection: 'column',
        alignSelf: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 20,
        backgroundColor: 'transparent',
        borderLeftColor: bordaContainerComponente2,
        borderRightColor: bordaContainerComponente2,
        borderBottomColor: '#202020',
        borderRightWidth: 2,
        borderTopColor: 'white',
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderTopWidth: 0,
        padding: 15,
        
      }}
    >
      {memorias.map((memoria, index) => (
        <View key={memoria.id || index} style={{ alignSelf: 'center', marginVertical: 10, marginHorizontal:10 }}>
          <TouchableOpacity
            onLongPress={() =>
              setSelectedMemory(selectedMemory === memoria.id ? null : memoria.id)
            }
            activeOpacity={0.8}
          >
            <View style={{
              flexDirection: 'column',
              alignItems: 'center',
              borderWidth: 1.5,
              borderRadius: 5,
              padding: 10,
              marginHorizontal: 10, 
              
            }}>
              <Text style={{
                fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', margin:1
              }}>
                {memoria.texto}
              </Text>
              <Text style={{
                fontSize: 12,
                color: dataMensagemMemoriaTextoCor,
                fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',marginVertical: 0, marginHorizontal:5
              }}>
                {new Date(memoria.timestamp).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
          {selectedMemory === memoria.id && (
            <TouchableOpacity
              delayLongPress={200}
              onPress={() => {
                deleteMemory(memoria.id);
                setSelectedMemory(null);
                playSoundExcluir();
              }}
              style={{
                marginTop: 20,
                alignSelf: 'center',
                flexDirection: 'row',
                
              }}
            >
              <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </BlurView>
  </View>
</ScrollView>


    </Animated.View>
  );
};

export default TeladeMemorias;

import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, Dimensions, Keyboard, ScrollView, Platform, Easing  } from 'react-native';
import styles from '../components/style.js';
import { ThemeContext } from '../context/ThemeContext.js';
import AdicionarTarefa from '../components/AdicionarTarefa.js'; // Importando o componente
import { getDatabase, ref, push, set, onValue, remove, update, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { themes } from '../components/themes.js';
import { Audio } from 'expo-av';
import sounds from '../../assets/sounds.mp3'
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';




const TeladeRotinas = ({ initialXP = 0, initialLevel = 1 }) => {
  const [tarefasEstudo, setTarefasEstudo] = useState([]);
  const { width, height } = Dimensions.get('window');
  const { currentTheme } = useContext(ThemeContext);
  const LIMITE_TAREFAS = 12;
  const [mostrarAdicionarTarefa, setMostrarAdicionarTarefa] = useState(false);
  const { bordaContainerComponente, bordaContainerComponente2, backgroundContainer2 , limiteAtingidoCor,  textTitulos2,  botaoplustarefa} = currentTheme;
  const [tarefasVisiveis, setTarefasVisiveis] = useState({});
  const FadeAnim = useRef (new Animated.Value(0)).current;
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [mostrarTextoLixeira, setMostrarTextoLixeira] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const MAX_LEVEL = 500; // Máximo de níveis
  const XP_TO_NEXT_LEVEL = 500 ; // XP necessário para subir de nível
    // Estado para armazenar XP
    const [xp, setXp] = useState(initialXP);
    const [level, setLevel] = useState(initialLevel);
    const [xpNeeded, setXpNeeded] = useState(XP_TO_NEXT_LEVEL);



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

// Função única para tocar o som do tema selecionado
const SomdeTema = async (theme) => {
  const soundFile = themeSounds[theme];
  if (soundFile) {
    const { sound } = await Audio.Sound.createAsync(sounds);
    await sound.playAsync();
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




// UseEffect para carregar XP e nível ao iniciar o app
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
    }, 1000); // 1000ms = 1 segundo
  
    return () => clearInterval(interval);
  }, []);


  

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



const removeXPFromFirebase = async (userId, xpToRemove = 30) => {
  try {
    const db = getDatabase();
    const xpRef = ref(db, `usuarios/${userId}/xp`);

    // Obter o XP atual
    const snapshot = await get(xpRef);
    let currentXP = snapshot.exists() ? snapshot.val() : 0;

    // Subtrai o XP desejado, garantindo que não seja negativo
    const newXP = Math.max(0, currentXP - xpToRemove);

    // Atualiza o valor no Firebase
    await set(xpRef, newXP);
    console.log(`XP atualizado: ${newXP}`);
  } catch (error) {
    console.error("Erro ao remover XP do Firebase:", error);
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





 



  const themeSounds = {
    Dark: require    ('../../assets/DarkSound.mp3'),
    Light: require   ('../../assets/WhiteSound.mp3'),
    Blue: require    ('../../assets/CelestialSound.mp3'),
    Pink: require    ('../../assets/PinkSound.mp3'),
    Unicorn: require ('../../assets/UnicornioSound.mp3'),
};

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      console.log("Teclado apareceu, mas não vai empurrar a tela!");
    });
  
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      console.log("Teclado oculto.");
    });
  
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);










  useEffect(() => {
  console.log("Tarefas atualizadas:", tarefasEstudo);
  // Esse useEffect vai ser chamado toda vez que 'tarefasEstudo' mudar
}, [tarefasEstudo]);

useEffect(() => {
  if (tarefasEstudo.length >= LIMITE_TAREFAS) {
    setMostrarAviso(true);

    const timer = setTimeout(() => {
      setMostrarAviso(false);
    }, 3000); // Oculta após 5 segundos

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }
}, [tarefasEstudo]); // Executa sempre que a lista de tarefas mudar











useEffect(() => {
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (userId) {
    const tarefasRef = ref(db, `usuarios/${userId}/tarefasEstudo`);
    const setDiarioRef = ref(db, `usuarios/${userId}/setDiario`);

    onValue(tarefasRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const tarefasArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setTarefasEstudo(tarefasArray);
      } else {
        console.log("Nenhuma tarefa encontrada.");
        setTarefasEstudo([]);
      }
    }, { onlyOnce: true });

    // 🔄 Verifica o estado de "setDiario" ao logar
    onValue(setDiarioRef, (snapshot) => {
      const hoje = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

      if (!snapshot.exists() || snapshot.val() !== hoje) {
        console.log("🔄 Primeiro login do dia. Resetando tarefas...");
        resetarEstadoDasTarefas(userId);

        // Atualiza "setDiario" com a data atual
        set(ref(db, `usuarios/${userId}/setDiario`), hoje);
      } else {
        console.log("✅ Usuário já logou hoje. Nenhuma ação necessária.");
      }
    }, { onlyOnce: true });
  }
}, []);

const intervalRef = useRef(null);

useEffect(() => {
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(23, 59, 59, 0);

  if (now >= targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntilTarget = targetTime.getTime() - now.getTime();

  const timeout = setTimeout(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    const db = getDatabase();

    if (userId) {
      resetarEstadoDasTarefas(userId);
      set(ref(db, `usuarios/${userId}/setDiario`), new Date().toISOString().split("T")[0]);
    }

    intervalRef.current = setInterval(() => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      const db = getDatabase();

      if (userId) {
        resetarEstadoDasTarefas(userId);
        set(ref(db, `usuarios/${userId}/setDiario`), new Date().toISOString().split("T")[0]);
      }
    }, 24 * 60 * 60 * 1000);
  }, timeUntilTarget);

  return () => {
    clearTimeout(timeout);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, []);

const resetarEstadoDasTarefas = async (userId) => {
  if (!userId) return;

  const db = getDatabase();
  const tarefasRef = ref(db, `usuarios/${userId}/tarefasEstudo`);
  const userRef = ref(db, `usuarios/${userId}`);

  onValue(tarefasRef, (snapshot) => {
    if (snapshot.exists()) {
      let xpGanho = 0;
      const tarefas = snapshot.val();
      const updates = {};

      Object.keys(tarefas).forEach((key) => {
        if (tarefas[key].concluido) {
          xpGanho += 3;
          updates[`usuarios/${userId}/tarefasEstudo/${key}/concluido`] = false;
        }
      });

      onValue(userRef, (userSnap) => {
        if (userSnap.exists()) {
          const userData = userSnap.val();
          const xpTotal = (userData.xp || 0) + xpGanho;
          updates[`usuarios/${userId}/xp`] = xpTotal;

          update(ref(db), updates)
            .then(() => {
              console.log(`🎉 Reset concluído! XP ganho: ${xpGanho}`);
            })
            .catch((error) => {
              console.error("Erro ao resetar tarefas:", error);
            });
        }
      }, { onlyOnce: true });
    }
  }, { onlyOnce: true });
};














useEffect(() => {
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (userId) {
    const tarefasRef = ref(db, `usuarios/${userId}/tarefasEstudo`);

    // Adiciona o listener em tempo real
    const unsubscribe = onValue(tarefasRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const tarefasArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setTarefasEstudo([...tarefasArray]); // Atualiza estado para renderizar a FlatList
      } else {
        setTarefasEstudo([]);
      }
    });

    // Removendo listener ao desmontar o componente
    return () => unsubscribe();
  }
}, []);









  const toggleTarefa = (id, aprimoramentoLista, setAprimoramentoLista) => {
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const tarefaIndex = tarefasEstudo.findIndex(
    (tarefas) => tarefas.id === id
  );
  if (tarefaIndex === -1) return;

  // Captura o estado atual do item
  const currentState = tarefasEstudo[tarefaIndex].concluido;

  // Cria uma nova lista e inverte o estado do item selecionado
  const novaLista = [...tarefasEstudo];
  novaLista[tarefaIndex].concluido = !currentState;
  setTarefasEstudo(novaLista);

  // Atualiza o item no Firebase
  const tarefaRef = ref(db, `usuarios/${userId}/tarefasEstudo/${id}`);
  set(tarefaRef, novaLista[tarefaIndex]);

  // Se a tarefa foi marcada como concluída, adiciona 30 XP; se não, remove 30 XP
  if (!currentState) { 
    addXP(25);
  } else {
    removeXPFromFirebase(userId, 25);
  }
};


  const adicionarNovaTarefa = (nomeTarefa, horario) => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId || tarefasEstudo.length >= LIMITE_TAREFAS) return;

    const novaRef = push(ref(db, `usuarios/${userId}/tarefasEstudo`)); // Cria uma nova referência no Firebase
    const nova = {
      nome: nomeTarefa,
      xp: 3,
      horario: horario,
      concluido: false,
    };

    set(novaRef, nova)
      .then(() => {
        console.log("✅ Tarefa adicionada com sucesso no Firebase:", nova);
        console.log("🔗 ID da tarefa:", novaRef.key);

        // Atualiza a lista imediatamente sem esperar o Firebase
        setTarefasEstudo((prev) => [...prev, { id: novaRef.key, ...nova }]);
      })
      .catch((error) => {
        console.error("❌ Erro ao adicionar tarefa no Firebase:", error);
      });
  };


    const [isMuted, setIsMuted] = useState(false); // Estado para controlar o áudio
    const toggleMute = () => {
      setIsMuted(!isMuted); // Alterna entre silenciar e desmutar
    };
  
  

{/* remover tarefa*/}
  const removerTarefa = (id) => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;
  
    // Referência da tarefa no Firebase
    const tarefaRef = ref(db, `usuarios/${userId}/tarefasEstudo/${id}`);
    
    // Remove do Firebase
    remove(tarefaRef)
      .then(() => {
        console.log("✅ Tarefa removida com sucesso!");
  
        // Atualiza o estado local removendo a tarefa
        setTarefasEstudo((prev) => prev.filter((tarefa) => tarefa.id !== id));
      })
      .catch((error) => {
        console.error("❌ Erro ao remover tarefa:", error);
      });
  };



  
   // Função para tocar o som baseado no tema selecionado
   const playSoundRotinasMaisMenos = async () => {
    try {
      const soundFile = RotinasABOnSounds[currentTheme.name] || RotinasABOnSounds.default;
      
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
    } catch (error) {
      console.error('Erro ao tocar o som:', error);
    }
  };
  
  const RotinasABOnSounds = {
    dark: require('../../assets/DarkSound.mp3'),
    light: require('../../assets/WhiteSound.mp3'),
    blue: require('../../assets/CelestialSound.mp3'),
    pink: require('../../assets/PinkSound.mp3'),
    unicorn: require('../../assets/UnicornioSound.mp3'),
    default: require('../../assets/somTransiçao1.mp3'), // Som padrão
  };
  
  
// Função para tocar o som baseado no tema selecionado
const playSoundApagarR = async () => {
  try {
    const soundFile = apagarRSounds[currentTheme.name] || apagarRSounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const apagarRSounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somdeExcluir.mp3'), // Som padrão
};




const playSoundConcluido = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/DarkSound.mp3') // Som para quando concluir
    );
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som de concluído:', error);
  }
};

const playSoundNaoConcluido = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/UnicornioSound.mp3') // Som para quando não estiver concluída
    );
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som de não concluído:', error);
  }
};






  

  return (
    
<Animated.View
    style={{
      backgroundColor: backgroundContainer2,
      top: width * 0.005,
      width: width * 0.96,
      height: height * 0.8,
      borderWidth: 2,
      borderColor: bordaContainerComponente,
      alignSelf: 'center',
      borderRadius: 5,
      padding: 10,
      borderLeftColor: bordaContainerComponente2,
      borderRightColor: bordaContainerComponente2,
      borderBottomColor: 'gray',
      borderRightWidth: 2,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      borderTopWidth:0,
      borderTopColor:bordaContainerComponente2,
      opacity: fadeAnim
    }}
  >

      <View
        style={{
          ...styles.backgroundContainer,
          top: -height * 0.02,
          zIndex: 3,
          flexDirection: 'column',
          alignSelf: 'center',
          marginTop:10,
          position: 'relative',
          width: width * 0.87,
          height: height * 0.495,
        }}

        
      >



      


        <BlurView
          style={{
            position: 'relative',
            flexDirection: 'column',
            alignSelf: 'center',
            borderRadius: 10,
            overflow: 'hidden',
            marginVertical: 10,
            backgroundColor: 'transparent',
            borderLeftColor: bordaContainerComponente2,
            borderRightColor: bordaContainerComponente2,
            borderBottomColor: 'gray',
            borderRightWidth: 2,
            borderLeftWidth: 2,
            borderBottomWidth: 2,
            borderTopWidth:0,
            borderTopColor:bordaContainerComponente2,
            padding: 10,
            marginTop:10,
            width: width * 0.86,
          }}
        >

          {/* Botão "+" fixo na tela */}
          <View
            style={[
              styles.section,
              { zIndex: 6, position: 'relative', alignSelf: 'center', padding: 10 },
            ]}
          >
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: -width * 0.0,
                right: -height * 0,
              }}
              onPress={() => {
                setMostrarAdicionarTarefa(!mostrarAdicionarTarefa);
                playSoundRotinasMaisMenos();
              }}
            >
              <Text style={[styles.textTarefas, { color: botaoplustarefa, fontSize: 26, color:'black' }]}>
                {mostrarAdicionarTarefa ? '⚊' : '✙'}
              </Text>
            </TouchableOpacity>
          </View>





{tarefasEstudo.length === 0 && (
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
      Crie sua rotina programada e evolua a si mesmo!
    </Text>
  </View>
)}




          {/* Componente AdicionarTarefa */}
          {mostrarAdicionarTarefa && (
            <View style={{ marginTop: 10, alignItems: 'center', zIndex: 10, }}>
              <AdicionarTarefa onAdicionarTarefa={adicionarNovaTarefa} />
            </View>
          )}

          {/* Mensagem de limite atingido */}
          {mostrarAviso && (
            <Text style={{ color: limiteAtingidoCor, textAlign: 'center', margin:15 }}>❕ Limite Atingido ❕</Text>
          )}

          {/* Tarefas de Estudo */}
          <View style={[styles.section, { zIndex: 8, position: 'relative', padding: 10, margin:20, marginHorizontal:height*0.01   }]}>
          <FlatList
  data={[...tarefasEstudo].sort((a, b) => a.horario.localeCompare(b.horario))}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center',  textAlign:'center', }}>
            <View style={{alignItems:'center', alignSelf:'center', textAlign:'center',  }}>
        {mostrarTextoLixeira && tarefaSelecionada === item.id && (
        <TouchableOpacity
          onPress={() => {
            removerTarefa(item.id);
            playSoundApagarR();
          }}
          style={{ padding:5, alignItems:'center', alignSelf:'center', textAlign:'center' , left:-3}}
        >
          <Text>🗑️</Text>
        </TouchableOpacity>
      )}
</View>
      <TouchableOpacity
        style={[
          styles.taskItem,
          item.concluido && styles.taskCompleted,
          tarefaSelecionada === item.id && { opacity: 0.4 },
        ]}
        onPress={() => {
          if (item.concluido) {
            playSoundNaoConcluido();
          } else {
            playSoundConcluido();
          }
          toggleTarefa(item.id);
        }}
        onLongPress={() => {
          SomdeTema();
          setTarefaSelecionada((prev) => {
            if (prev === item.id) {
              setMostrarTextoLixeira(false);
              return null;
            } else {
              setMostrarTextoLixeira(true);
              return item.id;
            }
          });
        }}
        delayLongPress={300}
      >
        <Text style={[styles.textTarefas, { color: textTitulos2, textAlign:'left'}]}>
          🕗 {String(item.horario).replace('+', '')}
          {item.concluido ? ` ☛ 🔳 ${item.nome} ` : ` ☛ 🔲 ${item.nome}`}
        </Text>

              </TouchableOpacity>


        

     
    </View>
  )}
  ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'gray', marginVertical: 5 }} />}
/>
          </View>

       

        </BlurView>

      </View>
     

  </Animated.View>

  );
};

export default TeladeRotinas;
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, Dimensions, Keyboard, Platform, Easing  } from 'react-native';
import styles from '../components/style.js';
import { ThemeContext } from '../context/ThemeContext.js';
import { getDatabase, ref, push, set, onValue, remove, update, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { themes } from '../components/themes.js';
import { Audio } from 'expo-av';
import sounds from '../../assets/sounds.mp3'
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase'; // Importe seu arquivo de configuração do Firebase
import AdicionarTarefaAprimoramento from '../components/AdicionarTarefaAprimoramento.js';




const TeladeAprimoramento = ({ initialXP = 0, initialLevel = 1, }) => {
  const [aprimoramentoLista, setAprimoramentoLista] = useState([]);
  const { width, height } = Dimensions.get('window');
  const { currentTheme } = useContext(ThemeContext);
  const LIMITE_TAREFAS = 3;
  const [mostrarAdicionarAprimoramento, setMostrarAdicionarAprimoramento] = useState(false);
  const { bordaContainerComponente, bordaContainerComponente2 ,backgroundContainer, backgroundContainer2 , limiteAtingidoCor, textTitulos, sinaldeMais, textTitulos2, bordercontainerborda, botaoplustarefa} = currentTheme;
  const [aprimoramentosVisiveis, setAprimoramentosVisiveis] = useState({});
  const FadeAnim = useRef (new Animated.Value(0)).current;
  const [aprimoramentoSelecionado, setAprimoramentoSelecionado] = useState(null);
  const [mostrarTextoLixeira, setMostrarTextoLixeira] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const MAX_LEVEL = 500; // Máximo de níveis
  const XP_TO_NEXT_LEVEL = 500; // XP necessário para subir de nível
    // Estado para armazenar XP
    const [xp, setXp] = useState(initialXP);
    const [level, setLevel] = useState(initialLevel);
    const [xpNeeded, setXpNeeded] = useState(XP_TO_NEXT_LEVEL);
  
   // Estado animado para a barra de progresso
   const progress = useRef(new Animated.Value(0)).current;


const [checked, setChecked] = useState(false);

const fadeAnim = useRef(new Animated.Value(0)).current; // Inicialmente invisível


 // Função para o efeito de Fade In (Aparecer)
 const fadeIn = () => {
  Animated.timing(fadeAnim, {
    toValue: 1, // Opacidade total
    duration: 333, // Tempo da animação
    easing: Easing.ease,
    useNativeDriver: true,
  }).start();
};

// Função para o efeito de Fade Out (Desaparecer)
const fadeOut = () => {
  Animated.timing(fadeAnim, {
    toValue: 0, // Opacidade zero
    duration: 333,
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
      resetarEstadosAprimoramento(userId);
      set(ref(db, `usuarios/${userId}/setDiarioApm`), new Date().toISOString().split("T")[0]);
    }

    intervalRef.current = setInterval(() => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      const db = getDatabase();

      if (userId) {
        resetarEstadosAprimoramento(userId);
        set(ref(db, `usuarios/${userId}/setDiarioApm`), new Date().toISOString().split("T")[0]);
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


useEffect(() => {
      const checkDate = async () => {
        try {
          // Recupera a data salva
          const lastCheckedDate = await AsyncStorage.getItem('lastCheckedDate');
          const today = new Date().toLocaleDateString(); // Data de hoje (DD/MM/YYYY)
          
          // Verifica se a data armazenada é a mesma de hoje
          if (lastCheckedDate === today) {
            setChecked(true);  // Se já tiver marcado hoje, mantém o checkbox ativado
          }
        } catch (error) {
          console.error('Erro ao acessar o AsyncStorage', error);
        }
      };
  
      checkDate(); // Verifica a data ao carregar o componente
    }, []);
  


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


// Efeito para verificar a subida de nível
useEffect(() => {
  if (xp >= xpNeeded) {
    setLevel((prevLevel) => prevLevel + 1);
    setXpNeeded((prevXpNeeded) => prevXpNeeded );
    setXp(0);
  }

  
}, [xp]);





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
  console.log("Tarefas atualizadas:", aprimoramentoLista);
  // Esse useEffect vai ser chamado toda vez que 'tarefasEstudo' mudar
}, [aprimoramentoLista]);

useEffect(() => {
  if (aprimoramentoLista.length >= LIMITE_TAREFAS) {
    setMostrarAviso(true);

    const timer = setTimeout(() => {
      setMostrarAviso(false);
    }, 3000); // Oculta após 5 segundos

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }
}, [aprimoramentoLista]); // Executa sempre que a lista de tarefas mudar





useEffect(() => {
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (userId) {
    const aprimoramentoRef = ref(db, `usuarios/${userId}/aprimoramentoLista`);
    const setDiarioApm = ref(db, `usuarios/${userId}/setDiarioApm`);

    onValue(aprimoramentoRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const aprimoramentoArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAprimoramentoLista(aprimoramentoArray);
      } else {
        console.log("Nenhuma tarefa encontrada.");
        setAprimoramentoLista([]);
      }
    }, { onlyOnce: true });

    // 🔄 Verifica o estado de "setDiario" ao logar
    onValue(setDiarioApm, (snapshot) => {
      const hoje = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

      if (!snapshot.exists() || snapshot.val() !== hoje) {
        console.log("🔄 Primeiro login do dia. Resetando tarefas...");
        resetarEstadoDosAprimoramentos(userId);

        // Atualiza "setDiario" com a data atual
        set(ref(db, `usuarios/${userId}/setDiarioApm`), hoje);
      } else {
        console.log("✅ Usuário já logou hoje. Nenhuma ação necessária.");
      }
    }, { onlyOnce: true });
  }
}, []);


const resetarEstadoDosAprimoramentos = async (userId) => {
  if (!userId) return;

  const db = getDatabase();
  const aprimoramentoRef = ref(db, `usuarios/${userId}/aprimoramentoLista`);
  const userRef = ref(db, `usuarios/${userId}`);

  onValue(aprimoramentoRef, (snapshot) => {
    if (snapshot.exists()) {
      let xpGanho = 0;
      const tarefasA = snapshot.val();
      const updatesA = {};

      Object.keys(tarefasA).forEach((key) => {
        if (tarefasA[key].concluido) {
          xpGanho += 3;
          updatesA[`usuarios/${userId}/aprimoramentoLista/${key}/concluido`] = false;
        }
      });

      onValue(userRef, (userSnap) => {
        if (userSnap.exists()) {
          const userData = userSnap.val();
          const xpTotal = (userData.xp || 0) + xpGanho;
          updatesA[`usuarios/${userId}/xp`] = xpTotal;

          update(ref(db), updatesA)
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
    const aprimoramentoRef = ref(db, `usuarios/${userId}/aprimoramentoLista`);

    // Adiciona o listener em tempo real
    const unsubscribe = onValue(aprimoramentoRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const aprimoramentoArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setAprimoramentoLista([...aprimoramentoArray]); // Atualiza estado para renderizar a FlatList
      } else {
        setAprimoramentoLista([]);
      }
    });

    // Removendo listener ao desmontar o componente
    return () => unsubscribe();
  }
}, []);






    

  const toggleTarefa = (id) => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    
    if (!userId) return;
  
    const aprimoramentoIndex = aprimoramentoLista.findIndex(
      (aprimoramento) => aprimoramento.id === id
    );
    if (aprimoramentoIndex === -1) return;
  
    // Se já estiver concluído, não altera o estado (não reseta)
    if (aprimoramentoLista[aprimoramentoIndex].concluido) return;
  
    const novaLista = [...aprimoramentoLista];
    novaLista[aprimoramentoIndex].concluido = true;
    setAprimoramentoLista(novaLista);
  
    const aprimoramentoRef = ref(
      db,
      `usuarios/${userId}/aprimoramentoLista/${id}`
    );
        addXP(50);

    set(aprimoramentoRef, novaLista[aprimoramentoIndex]);
  };
  

  const adicionarNovoAprimoramento = (nomeAprimoramento, horario) => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId || aprimoramentoLista.length >= LIMITE_TAREFAS) return;

    const novaRef = push(ref(db, `usuarios/${userId}/aprimoramentoLista`)); // Cria uma nova referência no Firebase
    const nova = {
      nome: nomeAprimoramento,
      xp: 3,
      horario: horario,
      concluido: false,
    };

    set(novaRef, nova)
    .then(() => {
      console.log("✅ Tarefa adicionada com sucesso no Firebase:", nova);
      console.log("🔗 ID da tarefa:", novaRef.key);
      // Removida a atualização local para evitar duplicação
      // setAprimoramentoLista((prev) => [...prev, { id: novaRef.key, ...nova }]);
    })
    .catch((error) => {
      console.error("❌ Erro ao adicionar aprimoramento no Firebase:", error);
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
  
    // Referência da aprimoramento no Firebase
    const aprimoramentoRef = ref(db, `usuarios/${userId}/aprimoramentoLista/${id}`);
    
    // Remove do Firebase
    remove(aprimoramentoRef)
      .then(() => {
        console.log("✅ Tarefa removida com sucesso!");
  
        // Atualiza o estado local removendo a tarefa
        setAprimoramentoLista((prev) => prev.filter((aprimoramento) => aprimoramento.id !== id));
      })
      .catch((error) => {
        console.error("❌ Erro ao remover aprimoramento:", error);
      });
  };


  const resetarEstadosAprimoramento = async (userId) => {
    if (!userId) return;
  
    const db = getDatabase();
    const aprimoramentoRef = ref(db, `usuarios/${userId}/aprimoramentoLista`);
    const userRef = ref(db, `usuarios/${userId}`);
  
    // Pega as tarefas atuais
    onValue(aprimoramentoRef, (snapshot) => {
      if (snapshot.exists()) {
        let xpGanho = 0;
        const aprimoramento = snapshot.val();
        const updates = {}; // Objeto para atualizar apenas o campo "concluido"
  
        Object.keys(aprimoramento).forEach((key) => {
          if (aprimoramento[key].concluido) {
            xpGanho += 3; // Cada tarefa concluída dá 3 XP
            updates[`usuarios/${userId}/aprimoramentoLista/${key}/concluido`] = false; // Reseta "concluido"
          }
        });
  
        // Atualizar XP do usuário sem apagar nada
        onValue(userRef, (userSnap) => {
          if (userSnap.exists()) {
            const userData = userSnap.val();
            const xpTotal = (userData.xp || 0) + xpGanho;
            updates[`usuarios/${userId}/xp`] = xpTotal;
  
            // Aplicar todas as atualizações de uma vez para evitar apagar dados
            update(ref(db), updates).then(() => {
              console.log(`🎉 Reset concluído! XP ganho: ${xpGanho}`);
            }).catch((error) => {
              console.error("Erro ao resetar tarefas:", error);
            });
          }
        }, { onlyOnce: true });
      }
    }, { onlyOnce: true });
  };
  

    


 // Função para tocar o som baseado no tema selecionado
 const playSoundAprimoramentoOn = async () => {
  try {
    const soundFile = aprimoramentoOnSounds[currentTheme.name] || aprimoramentoOnSounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const aprimoramentoOnSounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somAprimoramentoONNN.mp3'), // Som padrão
};


 // Função para tocar o som baseado no tema selecionado
 const playSoundAprimoramentoMaisMenos = async () => {
  try {
    const soundFile = aprimoramentoABOnSounds[currentTheme.name] || aprimoramentoABOnSounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const aprimoramentoABOnSounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somTransiçao1.mp3'), // Som padrão
};


    



const notificaçaoASounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somNotificaçao3.mp3'), // Som padrão
};




 // Função para tocar o som baseado no tema selecionado
 const playSoundExcluirA = async () => {
  try {
    const soundFile = excluirASounds[currentTheme.name] || excluirASounds.default;
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao tocar o som:', error);
  }
};

const excluirASounds = {
  dark: require('../../assets/DarkSound.mp3'),
  light: require('../../assets/WhiteSound.mp3'),
  blue: require('../../assets/CelestialSound.mp3'),
  pink: require('../../assets/PinkSound.mp3'),
  unicorn: require('../../assets/UnicornioSound.mp3'),
  default: require('../../assets/somdeExcluir.mp3'), // Som padrão
};
  



const intervalRef = useRef(null);


  useEffect(() => {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(23, 59, 59, 0);

    if (now >= targetTime) {
      // Se já passou do horário, define para o dia seguinte
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntilTarget = targetTime.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (userId) {
        resetarEstadosAprimoramento(userId);
      }

      // Configura o intervalo para rodar todos os dias no mesmo horário
      intervalRef.current = setInterval(() => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;

        if (userId) {
          resetarEstadosAprimoramento(userId);
        }
      }, 24 * 60 * 60 * 1000); // 24 horas
    }, timeUntilTarget);

    // Limpeza na desmontagem do componente
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  return (
    
<Animated.View style={{backgroundColor:backgroundContainer2, top:width*0.005, width:width*0.96 , height: height * 0.93,  borderWidth:2, borderColor:bordaContainerComponente, alignSelf: 'center', borderRadius:5, padding:10,       borderLeftColor: bordaContainerComponente2,
            borderRightColor: bordaContainerComponente2,
            borderBottomColor: 'gray',
            borderRightWidth: 2,
            borderLeftWidth: 2,
            borderBottomWidth: 2,
            borderTopWidth:0,
            borderTopColor:bordaContainerComponente2,
            opacity: fadeAnim,
            }}>
    

    
    <Animated.View style={[backgroundContainer, { top: -height * 0.017, zIndex: 3, flexDirection: 'column', alignSelf: 'center', position: 'relative', marginTop: 10 }]}>  
  
     

     


<BlurView style={{ position:'absolute',flexDirection:'column',alignSelf:'center',  borderRadius:10, overflow:'hidden', marginVertical: 10, backgroundColor:'transparent', borderLeftColor:bordaContainerComponente2, borderRightColor:bordaContainerComponente2, borderBottomColor:'gray', borderRightWidth:2, borderLeftWidth:2, borderBottomWidth:2, padding:10, margin:10, top: width*0.0, width:width*0.86}}>
     

    {/* Botão "+" fixo na tela */}
    <View style={[styles.section,{ zIndex:6, position:'relative', alignSelf:'center', padding:5, marginTop:10}]}>
                <TouchableOpacity
          style={{
            position: 'absolute',
            top: -width * 0.03,
            left:-height *0.005,
            
               
                }}
          onPress={() =>{ 
            setMostrarAdicionarAprimoramento(!mostrarAdicionarAprimoramento);
            playSoundAprimoramentoMaisMenos();
          }}
        >
          <Text style={[styles.textTarefas, { color:'black', fontSize: 26, left:-height *0.004,
}]}>
            {mostrarAdicionarAprimoramento ? '⚊' : '✙'}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Componente AdicionarTarefa */}
      {mostrarAdicionarAprimoramento && (
        <View style={{ marginTop: 10, alignItems: 'center',  zIndex: 10 }}>
<AdicionarTarefaAprimoramento 
  onAdicionarTarefaAprimoramento={adicionarNovoAprimoramento}
  aprimoramentoCount={aprimoramentoLista.length}
/>        </View>
      )}
     
      {aprimoramentoLista.length === 0 && (
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
            Crie uma lista de aprimoramento pessoal, e reveja o que deseja aprender a cada dia.
          </Text>
        </View>
      )}

      {/* Mensagem de Capacidade Maxima atingida */}
      {mostrarAviso && (
  <Text style={{ color: limiteAtingidoCor, textAlign: 'center', padding:10,top:15 }}>
    ❕ Capacidade Máxima ❕
  </Text>
)}

      {/* Tarefas de Estudo */}
      <View style={[styles.section, { zIndex: 3, position: 'relative', padding: 15 }]}>
      <FlatList
  data={aprimoramentoLista}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={{ flexDirection: 'column', alignItems: 'center', }}>
      <TouchableOpacity
        style={[
          styles.taskItem,
          item.concluido && styles.taskCompleted,
          aprimoramentoSelecionado === item.id && { opacity: 0.6 },
        ]}
        onPress={() => {
          playSoundAprimoramentoOn();
          toggleTarefa(item.id);
          // Removido: handleCheckboxChange(); e a atualização incorreta do estado
        }}
        // Remova a propriedade disabled se não quiser que o item seja bloqueado
        // disabled={checked}
        onLongPress={() => {
          playSoundAprimoramentoOn();
          setAprimoramentoSelecionado((valorAnterior) => {
            if (valorAnterior === item.id) {
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
      <Text style={[styles.textTarefas, { color: textTitulos2, padding:10}]}>
     {item.concluido ? `💾 ${item.nome} 💾` : `💿 ${item.nome} 💿`}

</Text>

      </TouchableOpacity>


      {mostrarTextoLixeira && aprimoramentoSelecionado === item.id && (
        <TouchableOpacity
          onPress={() => {
            removerTarefa(item.id);
            playSoundExcluirA();
          }}
          style={{ marginLeft: 10 }}
        >
          <Text style={{ color: 'red', fontSize: 18,  }}>🗑️</Text>
        </TouchableOpacity>


      )}

      {/*
        Se houver detalhes extras, mantenha o código abaixo, mas verifique se não conflita com
        a estrutura da lista (por exemplo, não misture array com objeto).
      */}
      {aprimoramentoLista[item.id] && (
        <View style={{ marginLeft: 20 }}>
          <Text>Detalhes do aprimoramento: {item.detalhes}</Text>
        </View>
      )}
    </View>
  )}
/>



</View>

     </BlurView>
     
    </Animated.View>
    

    </Animated.View>

  );
};

export default TeladeAprimoramento;
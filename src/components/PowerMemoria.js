import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Image, Platform, Animated, Dimensions  } from 'react-native';
import { ThemeContext } from '../context/ThemeContext.js';
import { getDatabase, ref, onValue, set, get, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { Audio } from 'expo-av';
import { auth, db } from "../services/firebase.js"; // Importe corretamente seu auth e db
import { initialXP, initialLevel } from '../screens/TeladoPainel.js';
import AsyncStorage from '@react-native-async-storage/async-storage';



// Exemplo: array com 30 imagens (complete com os 30 assets que você possui)
const images = [
  { id: 1, source: require('../../assets/PowerMemoriaRangers1.png') },
  { id: 2, source: require('../../assets/PowerMemoriaRangers2.png') },
  { id: 3, source: require('../../assets/PowerMemoriaRangers3.png') },
  { id: 4, source: require('../../assets/PowerMemoriaRangers4.png') },
  { id: 5, source: require('../../assets/PowerMemoriaRangers5.png') },
  { id: 6, source: require('../../assets/PowerMemoriaRangers6.png') },
  { id: 7, source: require('../../assets/PowerMemoriaRangers7.png') },
  { id: 8, source: require('../../assets/PowerMemoriaRangers8.png') },
  { id: 9, source: require('../../assets/PowerMemoriaRangers9.png') },
  { id: 10, source: require('../../assets/PowerMemoriaRangers10.png') },
  { id: 11, source: require('../../assets/PowerMemoriaRangers11.png') },
  { id: 12, source: require('../../assets/PowerMemoriaRangers12.png') },
  { id: 13, source: require('../../assets/PowerMemoriaRangers13.png') },
  { id: 14, source: require('../../assets/PowerMemoriaRangers14.png') },
  { id: 15, source: require('../../assets/PowerMemoriaRangers15.png') },
  { id: 16, source: require('../../assets/PowerMemoriaRangers16.png') },
  { id: 17, source: require('../../assets/PowerMemoriaRangers17.png') },
  { id: 18, source: require('../../assets/PowerMemoriaRangers18.png') },
  { id: 19, source: require('../../assets/PowerMemoriaRangers19.png') },
  { id: 20, source: require('../../assets/PowerMemoriaRangers20.png') },
  { id: 21, source: require('../../assets/PowerMemoriaRangers21.png') },
  { id: 22, source: require('../../assets/PowerMemoriaRangers22.png') },
  { id: 23, source: require('../../assets/PowerMemoriaRangers23.png') },
  { id: 24, source: require('../../assets/PowerMemoriaRangers24.png') },
  { id: 25, source: require('../../assets/PowerMemoriaRangers25.png') },
  { id: 26, source: require('../../assets/PowerMemoriaRangers26.png') },
  { id: 27, source: require('../../assets/PowerMemoriaRangers27.png') },
  { id: 28, source: require('../../assets/PowerMemoriaRangers28.png') },
  { id: 29, source: require('../../assets/PowerMemoriaRangers29.png') },
  { id: 30, source: require('../../assets/PowerMemoriaRangers30.png') },

  // ... adicione os objetos de id 7 até 30
];

const { width, height } = Dimensions.get("window");



const generateCards = () => {
  // Embaralha as imagens disponíveis
  const shuffledImages = [...images].sort(() => Math.random() - 0.5);
  // Seleciona as 10 primeiras imagens para formar 10 pares (total de 20 cartas)
  const selectedImages = shuffledImages.slice(0, 10);
  let cards = [];
  selectedImages.forEach((img) => {
    // Cria duas cartas para cada imagem, adicionando um uniqueId para cada uma
    cards.push({ ...img, uniqueId: `${img.id}-1` });
    cards.push({ ...img, uniqueId: `${img.id}-2` });
  });
  // Embaralha o array de cartas duplicadas
  return cards.sort(() => Math.random() - 0.5);
};

export default function App() {
  const [cards, setCards] = useState(generateCards());
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCard, secondCard] = flippedCards;
      // Compara pelo id (as cartas duplicadas terão o mesmo id)
      if (firstCard.id === secondCard.id) {
        setMatchedCards((prevMatchedCards) => [...prevMatchedCards, firstCard.id]);
      }
      // Reinicia as cartas viradas após 1 segundo
      setTimeout(() => setFlippedCards([]), 777);
    }
  }, [flippedCards]);

  const handleCardPress = (card) => {
    // Verifica se a carta já foi virada (usando uniqueId) ou se já está combinada
    if (
      flippedCards.length < 2 &&
      !flippedCards.some((c) => c.uniqueId === card.uniqueId) &&
      !matchedCards.includes(card.id)
    ) {
      setFlippedCards([...flippedCards, card]);
    }
  };


    const { currentTheme } = useContext(ThemeContext);
    const { bordabordaGameBackground, bordaGame, bordabordaGameBackground2, bordaCardGame, textoTituloBordaCardGame, botaoReiniciarCor, gameLevel2Text, bordaContainerPowerMemoria } = currentTheme;
// Estado para o gameLevel (inicializa como null para diferenciar "não carregado")
const [gameLevel, setGameLevel] = useState(null);





const MAX_LEVEL = 500; // Máximo de níveis
  const XP_TO_NEXT_LEVEL = 500  ; // XP necessário para subir de nível
    // Estado para armazenar XP
    const [xp, setXp] = useState(initialXP);
    const [level, setLevel] = useState(initialLevel);
    const [xpNeeded, setXpNeeded] = useState(XP_TO_NEXT_LEVEL);
  
   // Estado animado para a barra de progresso
   const progress = useRef(new Animated.Value(0)).current;


   useEffect(() => {
    if (xp >= xpNeeded) {
      let newLevel = level + 1;
      let newXpNeeded = xpNeeded;
      
      // Calcular o excesso de XP
      let totalXP = xp;
      let excessXP = totalXP - xpNeeded; // O excesso de XP após alcançar o limite do nível atual
  
      // Subir de nível enquanto o XP for maior que o necessário
      while (excessXP >= newXpNeeded && newLevel < MAX_LEVEL) {
        excessXP -= newXpNeeded;
        newLevel++;
        newXpNeeded += 300; // Incremento do XP necessário para o próximo nível
      }
  
      // Definir o novo XP com o excesso que não atingiu o próximo nível
      setXp(excessXP);
      setLevel(newLevel);
      setXpNeeded(newXpNeeded);
  
      console.log(`Novo XP: ${excessXP}, Novo Nível: ${newLevel}`);
    }
  }, [xp, xpNeeded, level]);
  
  




  useEffect(() => {
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
  
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
  
    if (userId && (xp !== undefined || level !== undefined)) {
      saveXPToFirebase(userId, xp, level);
    }
  }, [xp, level]);
  




  
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
  const interval = setInterval(() => {
    const loadData = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (userId) {
        const { xp, level } = await loadXPFromFirebase(userId);
        setXp(xp);
        setLevel(level);
      }
    };
    loadData();
  }, 1000); // 1 segundo

  return () => clearInterval(interval); // Limpa o intervalo ao desmontar
}, []);

  
  // Efeito para animar a barra de progresso
  useEffect(() => {
    Animated.timing(progress, {
      toValue: xp / xpNeeded,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [xp, xpNeeded, progress]); // Adiciona progress como dependência
  
  
  
  // Adicionar XP e subir de nível se necessário
  const addXP = async (amount) => {
    console.log(`Tentando adicionar XP: ${amount}`);
  
    let newXP = xp + amount;
    let newLevel = level;
    let newXpNeeded = xpNeeded;
  
    // Verificar se o jogador deve subir de nível
    while (newXP >= newXpNeeded && newLevel < MAX_LEVEL) {
      newXP -= newXpNeeded;
      newLevel++;
    }
  
    if (newLevel >= MAX_LEVEL) {
      newLevel = MAX_LEVEL;
      newXP = 0;  // Resetar XP após atingir o nível máximo
    }
  
    console.log(`Novo XP: ${newXP}, Novo Nível: ${newLevel}, XP Necessário: ${newXpNeeded}`);
  
    // Atualizar o estado local
    setXp(newXP);
    setLevel(newLevel);
    setXpNeeded(newXpNeeded);
  
    // Atualizar no Firebase e AsyncStorage
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
  
    await saveXPToFirebase(userId, newXP, newLevel);
    await AsyncStorage.setItem("xp", newXP.toString());
    await AsyncStorage.setItem("level", newLevel.toString());
  
    console.log("XP atualizado com sucesso!");
  };
  
  
  
  // Salvar XP e nível ao mudar
  // Efeito para salvar XP e nível
  useEffect(() => {
    AsyncStorage.setItem("xp", String(xp ?? 0));
 AsyncStorage.setItem("level", String(level ?? 1));

  }, [xp, level]);

  
  







// Obtenha as instâncias do auth e do database
const auth = getAuth();
const db = getDatabase();

// Efeito para ler o gameLevelPowerM salvo no Firebase
useEffect(() => {
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    const levelRef = ref(db, `usuarios/${userId}/gameLevelPowerM`);
    onValue(levelRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameLevelPowerM(snapshot.val());
      } else {
        // Se não houver valor salvo, inicializa com 0
        setGameLevelPowerM(0);
      }
    });
  }
}, [auth.currentUser]);

// Efeito para atualizar o gameLevelPowerM no Firebase sempre que ele mudar
useEffect(() => {
  if (auth.currentUser && gameLevelPowerM !== null) {
    const userId = auth.currentUser.uid;
    set(ref(db, `usuarios/${userId}/gameLevelPowerM`), gameLevelPowerM)
      .then(() => console.log("gameLevelPowerM atualizado:", gameLevelPowerM))
      .catch(error => console.error("Erro ao atualizar gameLevelPowerM:", error));
  }
}, [gameLevelPowerM, auth.currentUser]);

// Exemplo: Se desejar incrementar o gameLevelPowerM periodicamente, você pode usar:




// Quando o jogo for completado, incrementa o gameLevel2
useEffect(() => {
  // Supondo que você tenha 10 pares, ou seja, matchedCards.length === 10 significa que o jogo foi concluído
  if (matchedCards.length === 10) {
    setGameLevelPowerM(prev => prev + 1);
  }
}, [matchedCards]);




useEffect(() => {
  let soundObject;

  const playSound = async () => {
    try {
      soundObject = new Audio.Sound();
      await soundObject.loadAsync(require("../../assets/somPowerMemoriaMusica.mp3")); // 🔥 Use require()
      await soundObject.setIsLoopingAsync(true);
      await soundObject.playAsync();
    } catch (error) {
      console.log("Erro ao reproduzir o áudio:", error);
    }
  };

  playSound();

  return () => {
    if (soundObject) {
      soundObject.unloadAsync();
    }
  };
}, []);


const [xpDiario, setXpDiario] = useState(0); // Estado para armazenar o XP do dia
const [gameLevelPowerM, setGameLevelPowerM] = useState(null);
const [jogoFinalizado, setJogoFinalizado] = useState(false);
const [limiteXPAlcancado, setLimiteXPAlcancado] = useState(false); // Estado para mostrar o alerta de limite

// Verifica o estado inicial de XP ao abrir o jogo
useEffect(() => {
  const verificarXP = async () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const xpRef = ref(db, `usuarios/${userId}/xp`);
    const xpSnapshot = await get(xpRef);
    const currentXP = xpSnapshot.exists() ? xpSnapshot.val() : 0;

    if (currentXP >= 1000) {
      setLimiteXPAlcancado(true); // Se o XP for maior ou igual a 1000, ativamos o alerta
    }

    // Verifica o XP diário
    const lastXPUpdateRef = ref(db, `usuarios/${userId}/lastXPUpdate`);
    const xpDiarioRef = ref(db, `usuarios/${userId}/xpDiario`);
    const lastXPUpdateSnapshot = await get(lastXPUpdateRef);
    const xpDiarioSnapshot = await get(xpDiarioRef);

    const today = new Date().toISOString().split("T")[0]; // Data atual no formato YYYY-MM-DD
    const lastXPUpdate = lastXPUpdateSnapshot.exists() ? lastXPUpdateSnapshot.val() : null;

    if (lastXPUpdate !== today) {
      // Se o último XP enviado não for hoje, resetamos o XP diário
      setXpDiario(0);
      // Atualiza a data de última atualização para o dia atual
      await update(ref(db, `usuarios/${userId}`), { lastXPUpdate: today, xpDiario: 0 });
    }

    // Pega o XP diário atual
    const xpDiarioAtual = xpDiarioSnapshot.exists() ? xpDiarioSnapshot.val() : 0;
    setXpDiario(xpDiarioAtual); // Atualiza o estado com o XP diário
  };

  verificarXP(); // Chama a função de verificação assim que o componente for montado
}, []); // O useEffect é chamado apenas uma vez no carregamento do componente

// Detecta quando o jogo foi concluído e incrementa o nível do jogo
useEffect(() => {
  if (matchedCards.length === 1) {
    setJogoFinalizado(true); // Marca o jogo como finalizado
  }
}, [matchedCards]);

// Incrementa o XP APENAS quando o jogo for finalizado
useEffect(() => {
  if (!jogoFinalizado || !auth.currentUser) return; // Garante que só execute quando necessário
  if (xpDiario >= 250) return; // Se o XP diário for maior ou igual a 1000, não faz mais atualizações

  const userId = auth.currentUser.uid;
  const xpRef = ref(db, `usuarios/${userId}/xp`);
  const lastUpdateRef = ref(db, `usuarios/${userId}/lastXPUpdate`);
  const xpDiarioRef = ref(db, `usuarios/${userId}/xpDiario`);

  const atualizarXP = async () => {
    try {
      const [xpSnapshot, lastSnapshot, xpDiarioSnapshot] = await Promise.all([
        get(xpRef),
        get(lastUpdateRef),
        get(xpDiarioRef),
      ]);

      const currentXP = xpSnapshot.exists() ? xpSnapshot.val() : 0;
      const lastXPUpdate = lastSnapshot.exists() ? lastSnapshot.val() : null;
      const xpDiarioAtual = xpDiarioSnapshot.exists() ? xpDiarioSnapshot.val() : 0;

      const today = new Date().toISOString().split("T")[0];
      let newXP = currentXP;

      if (lastXPUpdate !== today) {
        // Se for um novo dia, mantém o XP atual, mas permite continuar somando
        newXP = Math.min(currentXP + 50);
      } else {
        // Continua somando sem ultrapassar o limite
        newXP = Math.min(currentXP + 50);
      }

      // Atualiza o XP diário apenas se não atingir 1000
      const novoXPDiario = Math.min(xpDiarioAtual + 50, 250); // Exemplo: cada vez que o jogo termina, adiciona 100 XP ao XP diário, mas limita a 1000

      await update(ref(db, `usuarios/${userId}`), {
        xp: newXP,
        xpDiario: novoXPDiario, // Atualiza o XP diário
        lastXPUpdate: today, // Atualiza a data de última atualização
      });

      setXpDiario(novoXPDiario); // Atualiza o estado xpDiario local

      if (novoXPDiario >= 250) {
        setLimiteXPAlcancado(true); // Exibe alerta se o limite de XP diário for atingido
      }
    } catch (error) {
      console.error("Erro ao atualizar xp:", error);
    }
  };

  atualizarXP();
  setJogoFinalizado(false); // Reseta o estado para evitar loops
}, [jogoFinalizado, xpDiario]); // Adicionamos `xpDiario` no array de dependências para garantir que não faça update depois de atingir o limite


// Mostrar mensagem quando o limite de XP for alcançado
useEffect(() => {
  if (limiteXPAlcancado) {
    // Reseta a mensagem após 40 segundos
    setTimeout(() => {
      setLimiteXPAlcancado(false); // Reseta o estado para desaparecer a mensagem
    }, 10000);
  }
}, [limiteXPAlcancado]);

const [opacity] = useState(new Animated.Value(1)); // Valor inicial da opacidade para animação

useEffect(() => {
  if (limiteXPAlcancado) {
    // Animação de piscar neon
    const intervalo = setInterval(() => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3, // Diminui a opacidade para criar o efeito de piscar
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1, // Aumenta a opacidade novamente
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000); // Intervalo inicial de 1 segundo

    return () => clearInterval(intervalo); // Limpa o intervalo quando o componente for desmontado
  }
}, [limiteXPAlcancado, opacity]);

  useEffect(() => {
    if (auth.currentUser && gameLevelPowerM !== null) {
      const userId = auth.currentUser.uid;
      set(ref(db, `usuarios/${userId}/gameLevelPowerM`), gameLevelPowerM)
        .then(() => console.log("gameLevelPowerM atualizado:", gameLevelPowerM))
        .catch(error => console.error("Erro ao atualizar gameLevelPowerM:", error));
    }
  }, [gameLevelPowerM, auth.currentUser]);


  return (
    <Animated.View style={{justifyContent:'center', alignContent:'center', width:'100%', height:'100%',     backgroundColor:bordaContainerPowerMemoria, borderRadius:10, margin:10, 
    }}>





    <View style={[styles.container, {backgroundColor:bordabordaGameBackground2, margin:5, flexDirection:'row',borderColor: 'white',  }]}>
      <Text style={[styles.title, {color:textoTituloBordaCardGame, backgroundColor:botaoReiniciarCor, borderColor: 'white', borderTopRightRadius:100,
    borderBottomRightRadius:100,}]}>Power Memória</Text>
      

<View style= {{    borderWidth: 2,
    borderColor: bordabordaGameBackground, // você pode substituir por outra cor ou variável do tema
    alignItems: 'center',
    borderWidth:2,
    padding:8,
    borderRadius:25,
    borderTopWidth:2,
    borderLeftWidth:0,
    right:5,
    backgroundColor:bordabordaGameBackground,
    borderTopLeftRadius:100,
    borderBottomLeftRadius:100,
    margin:3
    
    }}>
      <Text style={[styles.levelDisplay,{color:gameLevel2Text,}]}>
  Level: {gameLevelPowerM !== null ? gameLevelPowerM : "0"}
</Text>
</View>

      <View style={styles.grid}>
        {cards.map((card) => {
          // Verifica se a carta deve estar virada: se estiver na lista de viradas ou se já foi combinada
          const isFlipped =
            flippedCards.some((c) => c.uniqueId === card.uniqueId) ||
            matchedCards.includes(card.id);
          return (
            <TouchableOpacity
              key={card.uniqueId} // Usamos uniqueId para o key
              style={[styles.card, isFlipped && styles.flipped]}
              onPress={() => handleCardPress(card)}
            >
              {isFlipped ? (
                <Image source={card.source} style={styles.image} />
              ) : (


                
                <View style={styles.cardBack}
                >

<Image 
        source={require('../../assets/CardBackground000.png')}
        style={styles.image}
      />
                </View>


              )}
            </TouchableOpacity>
          );
        })}
      </View>


    


      <View style={{ margin: 20, position:'static' }}>

      <View style={{margin:10}}>
      <Text style ={styles.neonText}>XP diário: {xpDiario}</Text> {/* Exibe o XP diário para o usuário */}
      {limiteXPAlcancado && <Text style ={styles.neonText}>Limite de XP diário atingido!</Text>} {/* Mensagem de alerta */}
    </View>



  <TouchableOpacity
    style={[styles.customButton, { backgroundColor: botaoReiniciarCor }]}
    onPress={() => {
      setCards(generateCards());
      setFlippedCards([]);
      setMatchedCards([]);
    }}
  >
    <Text style={styles.customButtonText}>Reiniciar</Text>
  </TouchableOpacity>
</View>

      
    </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:'row',
    flexWrap:'wrap',
    width:'98%',
    height:'99%',
    position:'absolute',
    alignSelf:'center',
    borderRadius:10,
    alignContent:'center',
    padding: 15,
    backgroundColor: "transparent",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ff00ff", // Cor da borda (cor de destaque)
    marginTop: 20,
    elevation: 5, // Efeito de elevação para dar um sombreamento
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 4 }, // Sombra mais para baixo
    shadowOpacity: 0.3, // Sombra sutil
    shadowRadius: 6, // Suaviza a sombra
    

  },
  title: {
    fontSize: 20,
    color: 'white',
    margin:5,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    borderWidth:2,
    padding:9,
    borderRadius:50,
    borderTopWidth:0.7,
    alignItems:'center',
    
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin:20

    
  },
  card: {
    width: '15%',
    height: '10%',
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
   
  },
  flipped: {
    backgroundColor: 'transparent',
    

  },
  image: {
    width: '100%',    height: '100%',
    
  },
  cardBack: {
    width: '99%',
    height: '99%',
    backgroundColor: '#202020',
    borderRadius: 5,
    


  },

  customButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white', // você pode substituir por outra cor ou variável do tema
    alignItems: 'center',
    borderWidth:2,
    padding:10,
    borderRadius:10,
    borderTopWidth:0.7
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    
  },
  levelDisplay: {
    fontSize: 18,

    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
   
    zIndex:100,
    fontWeight:'800'
   
    
  },
  neonText: {
    color: "#black", // Cor do texto neon
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    textShadowColor: "#black", // Cor da sombra (mesma do neon)
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
    animation: "neonBlink 1s infinite", // Efeito de neon piscando
    transition: "text-shadow 0.5s ease-in-out",
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },

  '@keyframes neonBlink': {
    '0%': {
      textShadow: '10px 0 10px #202020, 0 0 30px #202020, 0 0 30px #202020',
      color: "#202020",
    },
    '50%': {
      textShadow: '10px 0 5px #202020',
      color: "#202020",
    },
    '100%': {
      textShadow: '10px 0 10px #202020, 0 0 30px #202020, 0 0 30px #202020',
      color: "#202020",
    },
  },
});

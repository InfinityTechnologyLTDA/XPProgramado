import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Animated, Modal, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import Borda1 from '../../assets/Borda2.png';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import MuteButton from '../components/MuteButton';
import CheckLoginStreak from "../components/CheckLoginStreak";
import PerdidoNoEspaço from '../components/PerdidoNoEspaço';
import PowerMemoria from '../components/PowerMemoria';
import { Audio } from 'expo-av';
import { themes } from "../../src/components/themes"; 
import { getDatabase, ref, get, set, onValue } from "firebase/database"; // Firebase Realtime Database
import { db } from '../services/firebase'; // Importe seu arquivo de configuração do Firebase
import sounds from '../../assets/sounds.mp3'
import { getAuth } from "firebase/auth";







const TeladoPainel = ({ initialXP = 0, initialLevel = 1 }) => {
  
  const { currentTheme } = useContext(ThemeContext);
  const { text, text2, border, botaoAprimoramento, botaoEstudos, botaoTarefas, backgroundContainer, bordaContainerComponentePainel, textNivel, progressNivelCor, fundoBotaoJogoSombra  } = currentTheme;
  const {width, height} = Dimensions.get('window');
  const MAX_LEVEL = 500; // Máximo de níveis
  const XP_TO_NEXT_LEVEL = 500 ; // XP necessário para subir de nível
  const size = width * 0.26; // Define o tamanho como 25% da largura da tela
  const size2 = width * 0.15; // Define o tamanho como 25% da largura da tela
  const strokeWidth = width * 0.015; // Define a espessura da barra proporcionalmente
  const auth = getAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPowerVisible, setModalPowerVisible] = useState(false);
  const [modalPerdidoVisible, setModalPerdidoVisible] = useState(false);

  const themeSounds = {
    Dark: require    ('../../assets/DarkSound.mp3'),
    Light: require   ('../../assets/WhiteSound.mp3'),
    Blue: require    ('../../assets/CelestialSound.mp3'),
    Pink: require    ('../../assets/PinkSound.mp3'),
    Unicorn: require ('../../assets/UnicornioSound.mp3'),
};



  // Estado para armazenar XP
  const [xp, setXp] = useState(initialXP);
  const [level, setLevel] = useState(initialLevel);
  const [xpNeeded, setXpNeeded] = useState(XP_TO_NEXT_LEVEL);

 // Estado animado para a barra de progresso
 const progress = useRef(new Animated.Value(0)).current;



 const saveXPToFirebase = async (userId, xp, level, xpNeeded) => {
  try {
    const db = getDatabase();
    await set(ref(db, `usuarios/${userId}`), { xp, level, xpNeeded });
    console.log("XP, nível e xpNeeded salvos no Firebase!");
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
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    const db = getDatabase();
    const xpRef = ref(db, `usuarios/${userId}`);
    
    const unsubscribe = onValue(xpRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedXp = data.xp || 0;
        const loadedLevel = data.level || 1;
        const loadedXpNeeded = data.xpNeeded || XP_TO_NEXT_LEVEL;
  
        setXp(loadedXp);
        setLevel(loadedLevel);
        setXpNeeded(loadedXpNeeded);
        setDataLoaded(true);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  
  
  
// Efeito para animar a barra de progresso
useEffect(() => {
  if (xpNeeded > 0) {
    let newProgress = xp / xpNeeded;
    Animated.timing(progress, {
      toValue: newProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }
}, [xp, xpNeeded]);



  // Adicionar XP e subir de nível se necessário
  const addXP = async (amount) => {
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
  
    // Atualiza AsyncStorage e Firebase
    await AsyncStorage.setItem("xp", newXP.toString());
    await AsyncStorage.setItem("level", newLevel.toString());
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    await saveXPToFirebase(userId, newXP, newLevel, newXpNeeded);
  
    setXp(newXP);
    setLevel(newLevel);
    setXpNeeded(newXpNeeded);
  };
  
  

  // Salvar XP e nível ao mudar
  // Efeito para salvar XP e nível
 // Efeito para salvar XP e nível ao mudar (no AsyncStorage)
useEffect(() => {
  AsyncStorage.setItem("xp", xp.toString());
  AsyncStorage.setItem("level", level.toString());
}, [xp, level]);






   const playSelectSoundButton = async () => {
          if (themeConfig.soundsEnabled) {
            const soundFile = themeSounds[theme] || themeSounds.Dark;
            try {
              const { sound } = await Audio.Sound.createAsync(soundFile);
              await sound.playAsync();
            } catch (error) {
              console.error('Erro ao reproduzir o som:', error);
            }
          }
        };

     // Função única para tocar o som do tema selecionado
     const ativarSomDoTema = async () => {
      try {
        // Buscando o tema do Firebase
        const usuarioRef = db.collection('usuarios').doc(auth.currentUser?.uid);
        const doc = await usuarioRef.get();
        
        if (doc.exists) {
          // Pegando o tema ativo
          const temaAtivo = doc.data().temaAtivo; // O campo 'temaAtivo' tem o nome do tema selecionado (ex: 'light', 'dark', etc.)
          
          // Definindo o som correspondente ao tema
          const sound = themes[temaAtivo]?.sound; // Pega o som com base no nome do tema
          
          if (sound) {
            const { sound: audio } = await Audio.Sound.createAsync(sound);
            await audio.playAsync(); // Reproduz o som do tema
          } else {
            console.log("Som não encontrado para o tema:", temaAtivo);
          }
        } else {
          console.log("Documento não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar tema ou ativar som:", error);
      }
    };


    const [dataLoaded, setDataLoaded] = useState(false);


    const imagemBotao = require("../../assets/Shield.png");
    const imagemBotao2 = require("../../assets/CardBackground000.png");

    const [xpPercentage, setXpPercentage] = useState(0);

    useEffect(() => {
      if (xpNeeded && xp) {
        const percentage = (xp / xpNeeded) * 100;
        setXpPercentage(percentage);
      }
    }, [xp, xpNeeded]);



    

  return (
<View style={[styles.container, {
    width: width * 0.9999,
    height: height * 0.131,
    bottom: width * 0.00,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderTopEndRadius: 10,
    borderWidth: 2,
    borderColor: bordaContainerComponentePainel,
    borderTopColor: "white",
    borderTopWidth: 1,

    // Sombras no Android
    elevation: 10, 

    // Sombras no iOS
    shadowColor: "white",
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.5, // Deve estar entre 0 e 1
    shadowRadius: 5, // Deixa a sombra mais difusa
}]}>

      
      {/* Botões nos cantos */}



      <TouchableOpacity 
    onPress={() => {
        console.log("Botão pressionado, chamando addXP...");
    }}
    style={[styles.button1, styles.topLeft]}
>
    <CheckLoginStreak />
</TouchableOpacity>





      <TouchableOpacity
      onPress={playSelectSoundButton}
      style={[styles.button2, styles.topRight,]}>

  <MuteButton /> {/* Agora ele mantém a posição e o estilo */}
</TouchableOpacity>





 
      


      <TouchableOpacity
  onPress={playSelectSoundButton}
  style={[
    styles.button3,
    styles.bottomLeft,
    { backgroundColor: "transparent", alignSelf: "center" },
  ]}
>
  <TouchableOpacity
        onPress={() => setModalPowerVisible(true)}
        style={[
      styles.button3,
      styles.bottomLeft,
      { backgroundColor: "transparent", alignSelf: "center" },
    ]}
  >
    <Image
      source={imagemBotao2}
      style={{ width: 90, height: 90, resizeMode: "contain" }} // Ajuste o tamanho conforme necessário
    />
  </TouchableOpacity>
</TouchableOpacity>



  



   <TouchableOpacity
  onPress={playSelectSoundButton}
  style={[
    styles.button4,
    styles.bottomRight,
    { backgroundColor: "transparent", alignSelf: "center" },
  ]}
>
  <TouchableOpacity
    onPress={() => setModalPerdidoVisible(true)}
    style={[
      styles.button4,
      styles.bottomRight,
      { backgroundColor: "transparent", alignSelf: "center" },
    ]}
  >
    <Image
      source={imagemBotao}
      style={{ width: 60, height: 60, resizeMode: "contain", }} // Ajuste o tamanho conforme necessário
    />
  </TouchableOpacity>
</TouchableOpacity>



     


  



      <Image 
         source={Borda1}
         style={{ backgroundColor:'transparent',  width: size, top:height*-0.003, zIndex:5,alignItems: 'center', right:0.3
         }}
             resizeMode='contain'
             />



      {/* Barra de Progresso */}
       {/* Barra de Progresso Personalizada */}
       <View style={[styles.progressContainer, { width: width*0.25, top:height*0.03, position: 'absolute', alignItems: 'center',}]}>

       <AnimatedCircularProgress
    size={size2}
    width={strokeWidth}
fill={(xp / xpNeeded) * 100}
    tintColor={progressNivelCor}
    backgroundColor="#202020"
    rotation={0}
>
    {() => (
      <Text style={{ color: textNivel, fontWeight: 'bold', fontSize: 26, fontFamily: 'serif', marginBottom:5, left:0 }}>
        {level}
      </Text>
    )}
</AnimatedCircularProgress>




{/*    <View style={styles.progressBackground}>
       <Animated.View style={[styles.progressFill, { width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            }) }]} 
          />       
        </View> */}



<View style={{position:'absolute', top:width*0.12, justifyContent:'center', alignContent:'center'}}>
<Text style={[styles.progressText, {top:width*-0.027, fontSize:7, fontFamily: 'serif', alignSelf:'center', left:1 }]}>{Math.round((xp / xpNeeded) * 100)}%</Text>

</View>
        </View>



    



 {/* Modal para o jogo */}
 <Modal
      visible={modalPowerVisible}
      animationType="slide"
      onRequestClose={() => setModalPowerVisible(false)}
    >
      <View style={styles.modalContainer}>
        {/* Botão para fechar o modal */}
        <TouchableOpacity onPress={() => {
          setModalPowerVisible(false);
          }} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Fechar</Text>
        </TouchableOpacity>
        {/* Aqui você renderiza o jogo */}
        <PowerMemoria />
      </View>
    </Modal>


    <View style={styles.modalContainer2}>
     {/* Modal para PerdidoNoEspaço */}
     <Modal
        visible={modalPerdidoVisible}
        animationType="slide"
        onRequestClose={() => setModalPerdidoVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => {
            setModalPerdidoVisible(false);


          }} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
          <PerdidoNoEspaço />
        </View>
      </Modal>
      </View>


    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '96%',
    height: '15%',
    backgroundColor: '#202020',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    bottom:"1%",
    
  },
  button: {
    position: 'absolute',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 10,
  },
  button1: {
    position: 'absolute',
    padding: 23,
    backgroundColor: '#202020',
    borderRadius: 25,
  },
  button2: {
    position: 'absolute',
    padding: 23,
    backgroundColor: '#202020',
    borderRadius: 10,

  },
  button3: {
    position: 'absolute',
    padding: 23,
    backgroundColor: '#202020',
    borderRadius: 25,
  },
  button4: {
    position: 'absolute',
    padding: 23,
    backgroundColor: '#202020',
    borderRadius: 25,
  },
  topLeft: { bottom: "80%", left: "29%",  alignSelf:'center', backgroundColor:"transparent" },
  topRight: { top: "15%", right: "25%",   alignSelf:'center'  },
  bottomLeft: { bottom: -5, left: -5, padding:10 },
  bottomRight: { bottom: 3, right: 0, padding:10  },
  progressContainer: {
    position: 'absolute',
    bottom: 10,
    width: '20%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    overflow: 'hidden',
    color:'blue'

  },
  progressBar: {
    width: '100%',
    color:'white'
  },
  progressText: {
    marginTop: 5,
    fontSize: 10,
    color:'white',
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#202020',
    borderRadius: 6,
  },
  addXPButton: {
    marginTop: 10,
    fontSize: 18,
    color:'white',
    padding: 5,
  },
  openButton: {
    backgroundColor: '#3ee3f3',
    padding: 5,
    borderRadius: 5,
  },
  openButtonText: {
    fontSize: 13,
    color: 'white',
    fontWeight: 'bold',
    textAlign:'center',
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
    fontWeight: '600', 
    textShadowOffset: { width: 5, height: 5 }, 
    textShadowRadius: 10, 
    marginLeft:50,
    marginRight:50,
    bottom:20

  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black', // ou a cor que preferir
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 30,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
});

export default TeladoPainel

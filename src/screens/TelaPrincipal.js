import React from 'react';
import { Text, Image, View, TouchableOpacity, Dimensions, ScrollView, Animated, SafeAreaView, StatusBar, Platform } from 'react-native';
import styles from '../components/style.js';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState, useContext, useRef } from 'react';
import { BlurView } from 'expo-blur';
import TeladeAprimoramento from '../screens/TeladeAprimoramento.js';
import TeladeProgramacao from './TeladeProgramacao.js';
import TeladeRotinas from '../screens/TeladeRotinas.js'
import TeladoPainel from '../screens/TeladoPainel.js';
import TeladeMemorias from './TeladeMemorias.js';
import { Audio } from 'expo-av';
import { ThemeContext } from '../context/ThemeContext';
import { themes } from '../components/themes.js';
import SomTela from '../../assets/sounds.mp3';
import { logoutUser } from "../services/firebase.js"; // Certifique-se de que o caminho está correto



const TelaPrincipal = () => { 

  const [mostrarRotina, setMostrarRotina] = useState(true);
  const [mostrarProgramacao, setMostrarProgramacao] = useState(false);
  const [mostrarMemorias, setMostrarMemorias] = useState(false);
  const [mostrarAprimoramento, setMostrarAprimoramento] = useState(false);
  const [tituloTela, setTituloTela] = useState("Tarefas");




  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0, // Fica transparente
          duration: 500, // Tempo de desaparecimento
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1, // Volta a ficar visível
          duration: 500, // Tempo para reaparecer
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);




  const {width, height} = Dimensions.get('window');
  const { currentTheme, switchTheme } = useContext(ThemeContext); // Pegando o tema atual e a função de troca
  
  const { text, textoShadowComponentes, text4, botaoAprimoramento, botaoEstudos, botaoTarefas, backgroundContainer, bordercontainerborda, botaoMemorias, botaoSelecionarTema, botaoRelogar } = currentTheme;
  // Criando funções separadas para cada som
  const SomTrocaDeTela = async () => {
    const { sound } = await Audio.Sound.createAsync(SomTela);
    await sound.playAsync();
  };

  useEffect(() => {
    if (mostrarRotina) {
      setTituloTela("Hábitos");
    } else if (mostrarProgramacao) {
      setTituloTela("Programação");
    } else if (mostrarAprimoramento) {
      setTituloTela("Aprimoramento");
    } else if (mostrarMemorias) {
      setTituloTela("Memórias");
    }
  }, [mostrarRotina, mostrarProgramacao, mostrarAprimoramento, mostrarMemorias]);

  const themeSounds = {
    Dark: require    ('../../assets/DarkSound.mp3'),
    Light: require   ('../../assets/WhiteSound.mp3'),
    Blue: require    ('../../assets/CelestialSound.mp3'),
    Pink: require    ('../../assets/PinkSound.mp3'),
    Unicorn: require ('../../assets/UnicornioSound.mp3'),
};


const [botaoSelecionado, setBotaoSelecionado] = useState("rotina");

  const guia = () => {
    setBotaoSelecionado("rotina");
    setMostrarRotina(true);
    setMostrarProgramacao(false);
    setMostrarAprimoramento(false);
    setMostrarMemorias(false);
    SomdeTema(); // Chama a função de som

  };

  const guia2 = () => {
    setBotaoSelecionado("programacao");
    setMostrarProgramacao(true);
    setMostrarRotina(false);
    setMostrarAprimoramento(false);
    setMostrarMemorias(false);
    SomdeTema(); // Chama a função de som

  };

  const guia3 = () => {
    setBotaoSelecionado("aprimoramento");
    setMostrarAprimoramento(true);
    setMostrarProgramacao(false);
    setMostrarRotina(false);
    setMostrarMemorias(false);
    SomdeTema(); // Chama a função de som

  };

  const guia4 = () => {
    setBotaoSelecionado("memoria");
    setMostrarMemorias(true)
    setMostrarAprimoramento(false);
    setMostrarProgramacao(false);
    setMostrarRotina(false);
    SomdeTema(); // Chama a função de som

  };

   
      const navigation = useNavigation();
   

      // Função única para tocar o som do tema selecionado
           // Função única para tocar o som do tema selecionado
       // Criando funções separadas para cada som
       const SomdeTema = async () => {
         const { sound } = await Audio.Sound.createAsync(sound);
         await sound.playAsync();
       };



       const handleLogout = async () => {
        try {
          await logoutUser(); // Desloga do Firebase
          await AsyncStorage.removeItem("userLoggedIn");
    
          Alert.alert("Sucesso", "Você foi deslogado!");
    
          // 🔹 Redireciona para a tela de login
          navigation.navigate("TeladeLogin");
    
        } catch (error) {
          Alert.alert("Erro", "Houve um problema ao deslogar.");
          console.error("Erro no logout:", error);
        }
      };

         return (
          
            <SafeAreaView style={{flex:1, justifyContent:'center', backgroundColor:backgroundContainer, position:'relative', alignSelf: 'center', }}>
             
          


     <Animated.View style={{backgroundColor:backgroundContainer, width:width*1 , height: height * 0.96,  borderWidth:2, borderColor:bordercontainerborda, alignSelf: 'center', borderRadius:10, }}>
     <View style={{backgroundColor:backgroundContainer, width:width*0.97 , height: height * 0.85, borderWidth:2, borderColor:"black", alignSelf: 'center',borderRadius:10,}}>
      <Animated.View>     



      <BlurView style={{backgroundColor:backgroundContainer, padding:20, alignItems:'center',borderRadius:10, }}> 
      
    
  {/* Botão para deslogar */}
  <TouchableOpacity
  onPress={() => navigation.navigate('TeladeLogin')}
  style={{
          backgroundColor: 'transparent', // Pode ajustar a cor conforme seu design
          paddingVertical: 20,
          paddingHorizontal: 20,
          borderRadius: 5,
          marginTop: 20,
          position:'absolute',
          left:height*-0.045,
          top:width*-0.232
        }}
      >
       <Image 
     source={botaoRelogar}
     style={{width: width *0.22, height: height *0.2, opacity: 0.85, 
    }}
         resizeMode='contain'
         />
      </TouchableOpacity>
    

      <TouchableOpacity 
  style={{ 
   
    padding: 10, 
    paddingVertical: 20,
          paddingHorizontal: 20,
          borderRadius: 5,
          marginTop: 20,
          position:'absolute',
          right:height*-0.02,
          top:width*-0.15,
    backgroundColor:'transparent'
  }} 
  onPress={() => navigation.navigate('TeladeSelecaodeTemaDois')}
>
<Image 
     source={botaoSelecionarTema}
     style={{width: width *0.12, height: height *0.12,     opacity: 0.8, backgroundColor:'transparent'
     }}
         resizeMode='contain'
         />
</TouchableOpacity>


<View style={{borderTopWidth:2, borderLeftWidth:1,   marginVertical:10, borderBottomWidth:0.7, borderRightWidth:1, borderLeftColor:textoShadowComponentes, borderRightColor:textoShadowComponentes, borderBottomColor:'textoShadowComponentes', height: 'auto', alignContent:'center', zIndex:1, borderBottomColor:text, borderTopLeftRadius:5, borderTopRightRadius:5, paddingHorizontal:10,paddingBottom:3
}}> 
      <TouchableOpacity style={{borderRadius:5, color:'white', marginHorizontal:10, }}>
    
      <Animated.Text style={{ 
  fontSize: 22, 
  fontWeight: '600', 
  textShadowColor: textoShadowComponentes, 
  textShadowOffset: { width: 2, height: 2 }, 
  textShadowRadius: 10, 
  color: text4, 
  alignSelf: 'center',
  fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
}}>
  {tituloTela}
</Animated.Text>
         </TouchableOpacity>
         </View>


<View style={{flexDirection:'row', bottom:height*0, padding:10, alignItems:'center'}}>
<View style={{borderRadius:10, borderLeftWidth:2, borderRightWidth:2, borderLeftColor:"white", borderRightColor:'transparent', borderBottomWidth: mostrarProgramacao === true ? 2 : 0, borderBottomColor:'gray', width: width *0.2, height: height *0.2, right:width*0.155, bottom:height*0.08, zIndex:3,}}>  
<TouchableOpacity 
  style={{ width: width * 0.2, height: height * 0.2 }}
  onPress={() => {
    guia2();  // Chama a função guia2
    SomTrocaDeTela();
  }}
>


  
          <Image 
     source={botaoEstudos}
     style={{width: width *0.2, height: height *0.3, left:width*0.007,     opacity: botaoSelecionado === "programacao" ? 1 : 0.1, // Botão ativo 1, os outros 0.3
     }}
         resizeMode='contain'

         />
         </TouchableOpacity>
         </View>


         
         <View style={{ borderRadius:10, borderLeftWidth:2, borderRightWidth:2, borderLeftColor:"gold", borderRightColor:'transparent', borderBottomWidth: mostrarRotina === true ? 2 : 0, borderBottomColor:'gray', width: width *0.2, height: height *0.2,zIndex:1, bottom:height*0.070, left:width*0.12, padding:20, position:'absolute' }}>  
         <TouchableOpacity 
  style={{ width: width * 0.2, height: height * 0.2 }}
  onPress={() => {
    guia();  // Chama a função guia2
    SomTrocaDeTela();  }}
>
     <Image 
     source={botaoTarefas}
     style={{width: width *0.19, height: height *0.2, opacity: botaoSelecionado === "rotina" ? 1 : 0.1, transform: [{ rotate: '-30deg',}], // Gira 15 graus para o lado
    }}
         resizeMode='contain'
         />
         </TouchableOpacity>
         </View>


         <View style={{ borderRadius:10, borderLeftWidth:2, borderRightWidth:2, borderLeftColor:"gold", borderRightColor:'transparent', borderBottomWidth: mostrarAprimoramento === true ? 2 : 0, borderBottomColor:'gray', width: width *0.16, height: height *0.2, top:height*0.002, zIndex:1,  left:width*0.335 ,padding:20, position:'absolute' }}>  
         <TouchableOpacity 
  style={{ width: width * 0.2, height: height * 0.2 }}
  onPress={() => {
    guia3();  // Chama a função guia2
    SomTrocaDeTela();  }}
>
     <Image 
     source={botaoAprimoramento}
     style={{width: width *0.19, height: height *0.2,     opacity: mostrarAprimoramento ? 1 : 0.1,
     }}
         resizeMode='contain'
         />
         </TouchableOpacity>
         </View>

         <View style={{ borderRadius:10, borderLeftWidth:2, borderRightWidth:2, borderLeftColor:"gold", borderRightColor:'transparent', borderBottomWidth: mostrarMemorias === true ? 2 : 0, borderBottomColor:'gray', width: width *0.16, height: height *0.2, top:height*0.02, zIndex:1,  right:width*0.55, padding:20, position:'absolute' }}>  
         <TouchableOpacity 
  style={{ width: width * 0.2, height: height * 0.2 }}
  onPress={() => {
    guia4();  // Chama a função guia2
    SomTrocaDeTela();  }}
>
     <Image 
     source={botaoMemorias}
     style={{width: width *0.35, height: height *0.15,     opacity: mostrarMemorias ? 1 : 0.1,
     }}
         resizeMode='contain'
         />
         </TouchableOpacity>
         </View>




</View>










  {/* Renderiza a guia correta */}

          {mostrarRotina && <TeladeRotinas />}
          {mostrarProgramacao && <TeladeProgramacao />}
          {mostrarAprimoramento && <TeladeAprimoramento />}
          {mostrarMemorias && <TeladeMemorias/>}





        </BlurView>
        
      </Animated.View>
      
     </View>
     
     </Animated.View>

          <TeladoPainel/>

     </SafeAreaView>
   
         );
};
 
export default TelaPrincipal;
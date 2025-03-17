import React, { useEffect, useState, useContext } from 'react';
import { View, Image, Animated, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../components/style.js';
import { ThemeContext } from '../context/ThemeContext.js';
import { Audio } from 'expo-av';
import initialsound from '../../assets/initialsound.mp3'


const mensagens = [
  "Quando você tem um plano, quase nada te pega de surpresa.",
  "O sucesso não vem da motivação, mas da disciplina diária.",
  "Construir uma rotina ou viver apagando incêndios todos os dias?",
  "Cada hábito que você repete é um tijolo na construção.",
  "Sem rotina, o caos assume o controle. Quem não planeja, sempre vive no improviso.",
  "A excelência não é um ato, mas um hábito. Diariamente Você define quem pode ser.",
  "Rotina não é prisão, é poder...",
  "Se você não controlar seu tempo, alguém ou algo vai fazer isso por você.",
  "A rotina é a escada que leva do sonho à realidade.",
  "O progresso acontece no ordinário e na repetição",
  "Quer mudar de vida? Mude pequenos hábitos.",
  "Disciplina é fazer o que precisa ser feito, mesmo quando você não quer.",
  "Pequenas ações diárias criam resultados gigantes no longo prazo.",
  "Cada dia sem uma plano não é um passo para mais longe dos seus sonhos?",
  "Sem rotina, você não tem um plano. Sem um plano, você só reage à vida.",
  "O maior segredo do sucesso não é talento, é consistência.",
  "Se você não estabelecer hábitos sólidos, a vida te arrasta para a bagunça.",
  "A rotina define quem chega lá e quem fica pelo caminho.",
  "Você pode escolher entre a disciplina da rotina ou a dor do arrependimento.",
  "Quer ter paz? Crie uma rotina. Quer viver na ansiedade? Ignore a rotina.",
  "Quem não organiza seu tempo acaba refém da pressa e do desespero.",
  "O segredo não é fazer muito de uma vez, mas um pouco todo dia.",
  "Rotina não significa tédio, significa eficiência e segurança.",
  "A liberdade verdadeira vem da disciplina. Quem tem rotina não vive à mercê da sorte.",
  "Rotina não é sobre fazer tudo igual, é sobre criar um sistema que te leva onde você quer chegar.",
  "Como pretende chegar em algum lugar novo repetindo os mesmos caminhos? organização é poder.",
  "Quem não tem rotina se perde no tempo e na bagunça mental.",
  "A vida cobra organização. Quem não se planeja vive atrasado, estressado e improdutivo.",
  "Se você quer mudar sua vida, comece organizando sua rotina. Pequenos hábitos mudam tudo.",
  "Você já percebeu que os mais bem-sucedidos têm hábitos sólidos? Isso não é coincidência, é estratégia!"
];

const TelaInicial = () => {
  const navigation = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [mensagem, setMensagem] = useState('');
  const { currentTheme } = useContext(ThemeContext);

  useEffect(() => {
    setMensagem(mensagens[Math.floor(Math.random() * mensagens.length)]);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      navigation.navigate('TeladeSelecaodeTema');
    }, 8000);
  }, []);



useEffect(() => {
    // Função para tocar o som ao iniciar a tela
    const playStartSound = async () => {
      const { sound } = await Audio.Sound.createAsync( initialsound );
      await sound.playAsync();
    };

    playStartSound();
  }, []);


  return (
    <View style={[styles.containerPrincipal, { backgroundColor: currentTheme.background }]}> 
      <Animated.Image
        source={currentTheme.logo} // Define a imagem do tema
        style={{ opacity: fadeAnim, width: 200, height: 200, resizeMode: 'contain' }}
      />
      <Animated.Text 
        style={{ 
          opacity: fadeAnim, 
          color: currentTheme.text, 
          padding: 20, 
          fontSize: 16, 
          fontWeight: 'bold', 
          textAlign: 'center' ,
          fontFamily: 'monospace', // Fonte estilizada
          textShadowColor: "#666666", // Sombra do texto
          textShadowOffset: { width: 2, height: 2 }, // Deslocamento da sombra
          textShadowRadius: 10, // Raio da sombra
        }}>
        {mensagem}
      </Animated.Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('TelaPrincipal')} // Navega para TelaPrincipal
        style={{
          backgroundColor: 'transparent',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 5,
        }}>
        </TouchableOpacity>

    </View>
  );
};

export default TelaInicial;

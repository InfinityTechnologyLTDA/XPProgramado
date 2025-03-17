import { StyleSheet, Dimensions  } from "react-native";

const { width, height } = Dimensions.get("window"); // Obtém dimensões da tela

const styles = StyleSheet.create({

  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1200,
  },
  section:{
fontSize:16
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  borderContainer: {
    width: '100%',
    maxWidth: 1000,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 5,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // No React Native, boxShadow não funciona nativamente. Talvez precise de outra solução como o React Native Shadow
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  containerPainel:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: 'monospace', // Fonte estilizada
    color: "#333", // Cor do texto
    textShadowColor: "#666666", // Sombra do texto
    textShadowOffset: { width: 1, height: 1 }, // Deslocamento da sombra
    textShadowRadius: 5, // Raio da sombra
  },
  textTarefas: {
    fontSize: 18,
    fontWeight:'500',
    fontFamily: 'monospace', // Fonte estilizada
    textShadowColor: "#666666", // Sombra do texto
    textShadowOffset: { width: 2, height: 2 }, // Deslocamento da sombra
    textShadowRadius: 7, // Raio da sombra

  },
  containerPrincipal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#202020",
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    padding:'10'
  },
  button: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '70%',
  },
  button2:{
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '23.3%',
  },
  buttonLogin:{
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    width: '23.3%',
    margin:'10'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    
  },
  logo: {
    width: 200,
    height: 200,
  },
  link: {
    fontSize: 14, // Tamanho da fonte
    fontWeight: 'bold',
    fontFamily: 'monospace', // Fonte estilizada
    textDecorationLine: 'underline', // Simula um link
    textShadowColor: 'white', // Luz azul
    textShadowOffset: { width: 2, height: 2 }, // Posição da sombra
    textShadowRadius: 8, // Intensidade do brilho

  },
  linkText: {
    fontSize: 12, // Tamanho da fonte
    fontWeight: 'bold',
    fontFamily: 'monospace', // Fonte estilizada
    color: '#3ee3f3', // Azul neon
    textShadowColor: '#202020', // Luz azul
    textShadowOffset: { width: 2, height: 2 }, // Posição da sombra
    textShadowRadius: 5, // Intensidade do brilho

  },
  botaoFixado: {
    position: 'absolute', // Mantém fixo na tela
    bottom: 20, // Ajuste conforme necessário
    right: 20, // Ajuste conforme necessário
    width: 50, 
    height: 50,
    borderRadius: 25, // Para deixar redondo
    backgroundColor: 'blue', // Cor do botão
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Efeito de sombra no Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  modalTarefa: {
    position: 'absolute',
    bottom: 80, // Ajuste conforme necessário
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  textoModal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  containerPainel: {
    position: 'absolute',
    width: '90%',
    height: '20%',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPainel: {
    position: 'absolute',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 3,
  },
  topLeft: {
    top: height * 0.05, // 5% da altura da tela
    left: width * 0.05, // 5% da largura da tela
  },
  topRight: {
    top: height * 0.05,
    right: width * 0.05,
  },
  bottomLeft: {
    bottom: height * 0.05,
    left: width * 0.05,
  },
  bottomRight: {
    bottom: height * 0.05,
    right: width * 0.05,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 50,
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#222',  // Cor de fundo da barra
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFF', // Borda branca
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50', // Cor da barra preenchida
    borderRadius: 10,
    shadowColor: '#000', // Sombra para efeito 3D
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  progressTextPainel: {
    marginTop: 10,
    fontSize: 16,
  },
  levelText: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gold'
  },
  addXpButton: {
    marginTop: 20,
    backgroundColor: '#3ee3f3',
    padding: 10,
    borderRadius: 5
  },
  addXpText: {
    color: 'white',
    fontWeight: 'bold'
  },
  progressContainer: {
    position: 'absolute',
    bottom: 10,
    width: '20%',
    alignItems: 'center',
  },
  

  

});

export default styles;

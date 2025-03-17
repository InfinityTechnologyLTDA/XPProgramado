import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TelaInicial from './src/screens/TelaInicial.js';
import TelaPrincipal from './src/screens/TelaPrincipal.js';
import TeladoPainel from './src/screens/TeladoPainel.js';
import TeladeRotinas from './src/screens/TeladeRotinas.js';
import TeladeProgramacao from './src/screens/TeladeProgramacao.js';
import TeladeLogin from './src/screens/TeladeLogin.js';
import TeladeAtividadesdoDia from './src/screens/TeladeAtividadesdoDia.js';
import TeladeProezaseConquistas from './src/screens/TeladeProezaseConquistas.js'
import TeladeSelecaodeTema from   './src/screens/TeladeSelecaodeTema.js'
import TelaParametros from   './src/screens/TelaParametros.js'
import TeladeAprimoramento from './src/screens/TeladeAprimoramento.js'
import EnviarCodigo from './src/screens/EnviarCodigo.js';
import Cadastro from './src/services/Cadastro.js'; // Adicionando Cadastro
import PowerMemoria from './src/components/PowerMemoria.js';
import PerdidoNoEspaço from './src/components/PerdidoNoEspaço.js';
import TeladeSelecaodeTemaDois from './src/screens/TeladeSelecaodeTemaDois.js';
import { ThemeProvider } from './src/context/ThemeContext.js';
import { ThemeContext } from './src/context/ThemeContext';
import { SoundProvider } from "./src/components/SoundContext.js"; // Importa o contexto do som


console.log('ThemeContext no App:', ThemeContext);


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SoundProvider> {/* Envolve toda a aplicação */}
    <ThemeProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TelaInicial" screenOptions={{ headerShown: false }}>
      
        <Stack.Screen name="TelaInicial" component={TelaInicial} />

        <Stack.Screen name="TelaPrincipal" component={TelaPrincipal} />

        <Stack.Screen name="TeladoPainel" component={TeladoPainel} />

        <Stack.Screen name="TelaParametros" component={TelaParametros} />

        <Stack.Screen name="TeladeRotinas" component={TeladeRotinas} />
       
        <Stack.Screen name="TeladeProezaseConquistas" component={TeladeProezaseConquistas} />

        <Stack.Screen name="TeladeLogin" component={TeladeLogin} />

        <Stack.Screen name="Cadastro" component={Cadastro} /> 

        <Stack.Screen name="EnviarCodigo" component={EnviarCodigo} />

        <Stack.Screen name="TeladeAtividadesdoDia" component={TeladeAtividadesdoDia} />

        <Stack.Screen name="TeladeSelecaodeTema" component={TeladeSelecaodeTema} />

        <Stack.Screen name="TeladeSelecaodeTemaDois" component={TeladeSelecaodeTemaDois} />

        <Stack.Screen name="TeladeAprimoramento" component={TeladeAprimoramento} />

        <Stack.Screen name="PowerMemoria" component={PowerMemoria} />

        <Stack.Screen name="PerdidoNoEspaço" component={PerdidoNoEspaço} />

        <Stack.Screen name="TeladeProgramacao" component={TeladeProgramacao} />




      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
    </SoundProvider>

  );
};


export default App;
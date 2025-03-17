import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, Dimensions, Keyboard  } from 'react-native';
import styles from '../components/style.js';
import { ThemeContext } from '../context/ThemeContext.js';
import AdicionarTarefa from '../components/AdicionarTarefa.js'; // Importando o componente
import { getDatabase, ref, push, set, onValue, remove, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { themes } from '../components/themes.js';
import { Audio } from 'expo-av';
import sounds from '../../assets/sounds.mp3'




const TeladeEstudos = () => {
  const [tarefasEstudo, setTarefasEstudo] = useState([]);
  const { width, height } = Dimensions.get('window');
  const { currentTheme } = useContext(ThemeContext);
  const LIMITE_TAREFAS = 12;
  const [mostrarAdicionarTarefa, setMostrarAdicionarTarefa] = useState(false);
  const { text, text2, border, botaoAprimoramento, botaoEstudos, botaoTarefas, backgroundContainer, textTitulos, sinaldeMais, textTitulos2, bordercontainerborda, botaoplustarefa} = currentTheme;
  const [tarefasVisiveis, setTarefasVisiveis] = useState({});
  const FadeAnim = useRef (new Animated.Value(0)).current;
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [mostrarTextoLixeira, setMostrarTextoLixeira] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);


// Função única para tocar o som do tema selecionado
const SomdeTema = async (theme) => {
  const soundFile = themeSounds[theme];
  if (soundFile) {
    const { sound } = await Audio.Sound.createAsync(sounds);
    await sound.playAsync();
  }
};

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
    }, 5000); // Oculta após 5 segundos

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }
}, [tarefasEstudo]); // Executa sempre que a lista de tarefas mudar


  useEffect(() => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (userId) {
      const tarefasRef = ref(db, `usuarios/${userId}/tarefasEstudo`);

      onValue(tarefasRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const tarefasArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setTarefasEstudo(tarefasArray);
        } else {
          // Adicionar a tarefa padrão **APENAS UMA VEZ**
          const tarefaPadrao = {
            nome: "Lavar o rosto e escovar os dentes",
            xp: 3,
            horario: "06:00",
            concluido: false,
          };

          const novaRef = push(tarefasRef);
          set(novaRef, tarefaPadrao).then(() => {
            setTarefasEstudo([{ id: novaRef.key, ...tarefaPadrao }]);
          });
        }
      }, { onlyOnce: true }); // 🔹 Adicionando `{ onlyOnce: true }` para evitar execução contínua
    }
  }, []);




  useEffect(() => {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(23, 59, 0, 0); // Defina o horário desejado aqui
  
    const timeUntilTarget = targetTime.getTime() - now.getTime();
    
    // Se o horário alvo já passou no dia de hoje, aguarde até o mesmo horário no dia seguinte
    const timeout = setTimeout(() => {
      // Função para rodar a função de reset
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      resetarEstadoDasTarefas(userId);
      
      // Após o reset, configura o intervalo para rodar todos os dias no mesmo horário
      setInterval(() => {
        resetarEstadoDasTarefas(userId);
      }, 24 * 60 * 60 * 1000); // Intervalo de 24 horas
    }, timeUntilTarget);
  
    // Limpeza do efeito
    return () => clearTimeout(timeout);
  }, []);



  const toggleTarefa = (id) => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const tarefaIndex = tarefasEstudo.findIndex((tarefa) => tarefa.id === id);
    if (tarefaIndex === -1) return;

    const novaLista = [...tarefasEstudo];
    novaLista[tarefaIndex].concluido = !novaLista[tarefaIndex].concluido;
    setTarefasEstudo(novaLista);

    const tarefaRef = ref(db, `usuarios/${userId}/tarefasEstudo/${id}`);
    set(tarefaRef, novaLista[tarefaIndex]);
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


  const resetarEstadoDasTarefas = async (userId) => {
    if (!userId) return;
  
    const db = getDatabase();
    const tarefasRef = ref(db, `usuarios/${userId}/tarefasEstudo`);
    const userRef = ref(db, `usuarios/${userId}`);
  
    // Pega as tarefas atuais
    onValue(tarefasRef, (snapshot) => {
      if (snapshot.exists()) {
        let xpGanho = 0;
        const tarefas = snapshot.val();
        const updates = {}; // Objeto para atualizar apenas o campo "concluido"
  
        Object.keys(tarefas).forEach((key) => {
          if (tarefas[key].concluido) {
            xpGanho += 3; // Cada tarefa concluída dá 3 XP
            updates[`usuarios/${userId}/tarefasEstudo/${key}/concluido`] = false; // Reseta "concluido"
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
  
  

  

  return (
    
<Animated.View style={[backgroundContainer, { top: height * 0.05, zIndex: 3, flexDirection: 'column', alignSelf: 'center' }]}>
     
<TouchableOpacity
style={{position:'absolute',
  top: -50,
  left: 3,
  backgroundColor:'transparent'
}}
onPress={() => {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  resetarEstadoDasTarefas(userId);
}}>
  <Text style={{ color: 'white', padding: 10, backgroundColor: 'transparent', }}>
  👨🏽‍💻
  </Text>
</TouchableOpacity>
     
      {/* Botão "+" fixo na tela */}
      <View style={[styles.section,{ zIndex:6, position:'relative', alignSelf:'center',}]}>
                <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: width * 0.1,
            left:-height *0.015,
               
                }}
          onPress={() =>{ 
            setMostrarAdicionarTarefa(!mostrarAdicionarTarefa);
            SomdeTema();
          }}
        >
          <Text style={[styles.textTarefas, { color:botaoplustarefa, fontSize: 26,  }]}>
            {mostrarAdicionarTarefa ? '−' : '+'}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Componente AdicionarTarefa */}
      {mostrarAdicionarTarefa && (
        <View style={{ marginTop: 10, alignItems: 'center', top: height * 0, zIndex: 1 }}>
          <AdicionarTarefa onAdicionarTarefa={adicionarNovaTarefa} />
        </View>
      )}

      {/* Mensagem de limite atingido */}
      {mostrarAviso && (
  <Text style={{ color: 'red', textAlign: 'center' }}>
    ⚠️ Limite de 12 tarefas atingido!
  </Text>
)}

      {/* Tarefas de Estudo */}
      <View style={[styles.section, { zIndex: 3, position: 'relative', padding: 10 }]}>
      <FlatList
  data={[...tarefasEstudo].sort((a, b) => a.horario.localeCompare(b.horario))}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        style={[styles.taskItem, item.concluido && styles.taskCompleted, tarefaSelecionada === item.id && { opacity: 0.5 } ]}
        onPress={() => {
          SomdeTema();
          toggleTarefa(item.id)}}
        onLongPress={() => {
          SomdeTema();

          setTarefaSelecionada((prev) => {
            if (prev === item.id) {
              setMostrarTextoLixeira(false); // Se já estiver selecionado, desativa o texto da lixeira
              return null; // Desseleciona a tarefa
            } else {
              setMostrarTextoLixeira(true); // Ativa o texto da lixeira
              return item.id; // Marca a tarefa como selecionada
            }
          });
        }}
        delayLongPress={666}  // Espera 1 segundo para o efeito
      >
        <Text style={[styles.textTarefas, { color: textTitulos2 }]}>
          {item.concluido ? '✅ ' : '⬜ '}
          {String(item.horario).replace('+', '')} - {item.nome}
        </Text>
      </TouchableOpacity>

      {/* Exibe o texto da lixeira se a tarefa estiver selecionada */}
      {mostrarTextoLixeira && tarefaSelecionada === item.id && (
        <TouchableOpacity onPress={() => {
          removerTarefa(item.id);
          SomdeTema();

          }} style={{ marginLeft: 10 }}>
          <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  )}
/>
</View>

     
    </Animated.View>
  );
};

export default TeladeEstudos;
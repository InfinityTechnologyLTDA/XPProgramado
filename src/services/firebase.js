import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth"; 
import { getDatabase, ref, set, update, push, remove, get, } from "firebase/database";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";


// 🔹 Configuração do Firebase (MANTIDA, COMPLETA E FUNCIONAL)
const firebaseConfig = {
  apiKey: "AIzaSyAi0MIF8CdGabkPChRFam2qO9JaVptx-kM",
  authDomain: "xp-programado.firebaseapp.com",
  databaseURL: "https://xp-programado-default-rtdb.firebaseio.com/", // Certifique-se de usar o URL correto
  projectId: "xp-programado",
  storageBucket: "xp-programado.firebasestorage.app",
  messagingSenderId: "887021314123",
  appId: "1:887021314123:android:817ed1e1dfafbc7018adce",
};



// 🔹 Inicializa o Firebase apenas uma vez
const app = initializeApp(firebaseConfig);

// 🔹 Obtém a instância do Auth e Database (evita reinicialização)
let auth;

try {
  auth = getAuth();
} catch {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const database = getDatabase(app);
const db = getFirestore(app);


// 🔹 Criar usuário e perfil no banco de dados
const registerUser = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await set(ref(database, 'users/' + user.uid), {
      username,
      email,
      toDoList: {},
      panelData: {},
      xp: 0, 
      achievements: [],
    });
    return user;
  } catch (error) {
    throw error;
  }
};

// 🔹 Login de usuário
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// 🔹 Logout de usuário
const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// 🔹 Adicionar item à To-Do List do usuário
const addToDo = async (userId, toDoItem) => {
  try {
    const userRef = ref(database, `users/${userId}/toDoList`);
    const newToDoRef = push(userRef);
    await set(newToDoRef, toDoItem);
  } catch (error) {
    throw error;
  }
};

// 🔹 Buscar lista de tarefas do usuário
const getToDoList = async (userId) => {
  try {
    const userRef = ref(getDatabase(), `users/${userId}/toDoList`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data); // Retorna a lista de tarefas
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return [];
  }
};

// 🔹 Remover uma tarefa
const removeToDo = async (userId, taskId) => {
  try {
    const taskRef = ref(getDatabase(), `users/${userId}/toDoList/${taskId}`);
    await remove(taskRef);
  } catch (error) {
    console.error("Erro ao remover tarefa:", error);
  }
};

// 🔹 Atualizar painel do usuário
const updatePanel = async (userId, panelData) => {
  try {
    await update(ref(database, `users/${userId}/panelData`), panelData);
  } catch (error) {
    throw error;
  }
};

// 🔹 Atualizar XP do usuário
const updateXP = async (userId, xp) => {
  try {
    await update(ref(database, `users/${userId}`), { xp });
  } catch (error) {
    throw error;
  }
};

// 🔹 Adicionar conquista ao usuário
const addAchievement = async (userId, achievement) => {
  try {
    const achievementsRef = ref(database, `users/${userId}/achievements`);
    const newAchievementRef = push(achievementsRef);
    await set(newAchievementRef, achievement);
  } catch (error) {
    throw error;
  }
};

// 🔹 Exportação de serviços Firebase
export { auth, database, registerUser, loginUser, logoutUser, addToDo, updatePanel, updateXP, addAchievement, removeToDo, getToDoList, db   };

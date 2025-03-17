const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.resetarTarefasDiarias = functions.pubsub
  .schedule('every 24 hours')  // Define a execução diária
  .timeZone('America/Sao_Paulo')  // Fuso horário
  .onRun(async (context) => {
    const db = admin.database();
    const auth = admin.auth();

    const users = await admin.auth().listUsers();
    users.users.forEach(async (user) => {
      const userId = user.uid;
      const tarefasRef = db.ref(`usuarios/${userId}/tarefasEstudo`);

      await tarefasRef.set([]);  // Reseta as tarefas para o usuário
      console.log(`Tarefas resetadas para o usuário ${userId}`);
    });
  });

const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Configuração do transporte para o Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seu-email@gmail.com', // Substitua pelo seu e-mail
    pass: 'sua-senha-de-aplicativo', // Substitua pela senha de aplicativo gerada
  },
});

// Rota para enviar o e-mail
app.post('/send-email', (req, res) => {
  const { email } = req.body;

  // Verificar se o e-mail foi fornecido
  if (!email) {
    return res.status(400).json({ error: 'O campo "email" é obrigatório.' });
  }

  // Gerar um código aleatório de 6 dígitos
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  // Definir o conteúdo do e-mail
  const mailOptions = {
    from: 'seu-email@gmail.com',
    to: email,
    subject: 'Código de Recuperação de Senha',
    text: `Olá, aqui está o seu código de recuperação de senha: ${verificationCode}\n\nInsira este código no aplicativo para continuar o processo de redefinição de senha.`,
  };

  // Enviar o e-mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar o e-mail:', error);
      return res.status(500).json({ error: 'Erro ao enviar o e-mail.' });
    }
    console.log('E-mail enviado:', info.response);
    res.status(200).json({ message: 'Código de recuperação enviado com sucesso!', code: verificationCode });
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const nodemailer = require('nodemailer');

// Vamos criar uma conta de teste automática (Ethereal)
// Isso evita ter que configurar senhas reais por enquanto
const criarTransportador = async () => {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: testAccount.user, // usuário gerado automaticamente
      pass: testAccount.pass, // senha gerada automaticamente
    },
  });

  return transporter;
};

module.exports = criarTransportador;
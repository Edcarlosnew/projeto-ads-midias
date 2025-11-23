const nodemailer = require('nodemailer');
require('dotenv').config(); // Importante para ler o .env

const criarTransportador = async () => {
  // CONFIGURAÇÃO REAL (GMAIL)
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, // Lê do arquivo .env
      pass: process.env.EMAIL_PASS  // Lê do arquivo .env
    },
  });

  return transporter;
};

module.exports = criarTransportador;
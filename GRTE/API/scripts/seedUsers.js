require('dotenv').config();
const bcrypt = require('bcrypt');
const { connect, mongoose } = require('../services/dbConnection');
const User = require('../models/User');

const SALT_ROUNDS = 10;

async function seedUsers() {
  try {
    await connect();

    console.log('Verificando se o usuário administrador já existe...');
    const existingUser = await User.findOne({ email: 'admin@example.com' });

    if (existingUser) {
      console.log('Usuário administrador já existe. Nenhum novo usuário foi criado.');
      return;
    }

    console.log('Criando usuário administrador...');
    const hashedPassword = await bcrypt.hash('345678', SALT_ROUNDS);

    await User.create({
      name: 'Administrador',
      email: 'admin@example.com',
      password: hashedPassword,
    });

    console.log('Usuário administrador criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB.');
  }
}

seedUsers();

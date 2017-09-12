const Sequelize = require('sequelize'); // typescript throws errors if do es6 import
import * as dotenv from 'dotenv-safe';

dotenv.load({
  path: './tests/.env'
});

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql'
});

const connection = sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err: Error) => {
    console.error('Unable to connect to the database:', err);
  });

export { connection, sequelize };
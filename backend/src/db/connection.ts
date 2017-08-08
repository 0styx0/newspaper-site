const Sequelize = require('sequelize'); // typescript throws errors if do es6 import
import config from '../../config';
const DB = config.DB;

const sequelize = new Sequelize(DB.NAME, DB.USER, DB.PASS, {
  host: DB.HOST,
  port: DB.PORT,
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
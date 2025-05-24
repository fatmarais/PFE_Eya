//const dbConfig = require("../config.js");

const {Sequelize} = require("sequelize");

const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: process.env.dialect,
  logging: console.log, 
  operatorsAliases: '0',
});

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    await sequelize.sync({alter : true});
  } catch (error) {
    console.error("Unable to connect to the database");
  }}

module.exports = {connectDb, sequelize};

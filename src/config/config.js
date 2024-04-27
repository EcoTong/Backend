require("dotenv").config();
const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST } = process.env;

module.exports = {
  development: {
    username: "root",
    password: null,
    database: "database_development",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+07:00",
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    port: 3306,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "mysql",
    timezone: "+07:00",
  },
};

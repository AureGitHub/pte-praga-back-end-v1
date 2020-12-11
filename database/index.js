const knex = require('knex');

const { databaseConfig } = require('../config');

module.exports = knex({
  client: 'pg', // pg is the database library for postgreSQL on knexjs
  //  connection: databaseConfig.DATABASE_URL
  connection: {
    host: databaseConfig.host, // Your local host IP
    user: databaseConfig.user, // Your postgres user name
    password: databaseConfig.password,
    database: databaseConfig.database,
    port: databaseConfig.port,
    ssl: { rejectUnauthorized: false }
  },  
});

'use strict';

const http = require('http');
const server = require('./server');

const { port } = require('./config').server;
const { isDevelopment } = require('./config');

async function bootstrap() {
  /**
   * Add external services init as async operations (db, redis, etc...)
   * e.g.
   * await sequelize.authenticate()
   */

  const IpLocal = isDevelopment ? '192.168.1.133' : '';
  return http.createServer(server.callback()).listen(port, IpLocal);
}

bootstrap()
  .then(server =>
    console.log(`🚀 Server listening on port ${server.address().port}!`),
  )
  .catch(err => {
    setImmediate(() => {
      console.error('Unable to run the server because of the following error:');
      console.error(err);
      process.exit();
    });
  });

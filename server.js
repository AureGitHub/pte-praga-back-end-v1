const Koa = require('koa');
const bodyParser = require('koa-bodyparser')();
const compress = require('koa-compress')();
const cors = require('@koa/cors')(/* Add your cors option */);
const helmet = require('koa-helmet')(/* Add your security option */);
const logger = require('koa-logger')();
var jwt = require('koa-jwt');

const {
  errorHandler,
  secureHandler,
  errorjwtHandler,
  nofoundHandler,
} = require('./middleware');
const applyApiMiddleware = require('./api');
const { isDevelopment, JWT_SECRET } = require('./config');

const server = new Koa();

server.use(errorjwtHandler);

var unprotected = [/\/public/, /\/login/, /favicon.ico/];
server.use(jwt({ secret: JWT_SECRET }).unless({ path: unprotected }));
/**
 * Add here only development middlewares
 */
if (isDevelopment) {
  console.log('modo desarrollo');
  server.use(logger);
} else {
  console.log('modo NO desarrollo');
}

server
  .use(secureHandler)
  .use(errorHandler)
  .use(helmet)
  .use(compress)
  .use(cors)
  .use(bodyParser);

applyApiMiddleware(server);
server.use(nofoundHandler);
module.exports = server;

const Koa = require('koa');
const bodyParser = require('koa-bodyparser')();
const compress = require('koa-compress')();
const cors = require('@koa/cors');
const helmet = require('koa-helmet')(/* Add your security option */);
const logger = require('koa-logger')();
var jwt = require('koa-jwt');
var path = require('path');
const serve = require('koa-static');
const {
  errorHandler,
  secureHandler,
  errorjwtHandler,
  nofoundHandler,
} = require('./middleware');
const applyApiMiddleware = require('./api');
const { isDevelopment, JWT_SECRET } = require('./config');

const server = new Koa();

// Aure 11

if (isDevelopment) {
  console.log('modo desarrollo');
  server.use(logger);
} else {
  console.log('modo NO desarrollo');
}

server.use(cors());

server.use(serve(path.join(__dirname, '/dist')));

server.use(errorjwtHandler);

var unprotected = [/\/public/, /\/dist/, /\/login/, /favicon.ico/];
server.use(jwt({ secret: JWT_SECRET }).unless({ path: unprotected }));
/**
 * Add here only development middlewares
 */

server
  .use(helmet)
  .use(compress)
  .use(bodyParser)
  .use(secureHandler)
  .use(errorHandler);

applyApiMiddleware(server);
server.use(nofoundHandler);
module.exports = server;

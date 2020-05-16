'use strict';
const controller = require('./jugadorxranking.controller');

const prefix = `/jugadorxranking`;
module.exports = Router => {
  const router = new Router({ prefix });

  router.get('/', controller.getAll);

  return router;
};

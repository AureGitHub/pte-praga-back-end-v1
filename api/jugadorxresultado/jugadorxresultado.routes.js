'use strict';
const controller = require('./jugadorxresultado.controller');

const prefix = `/jugadorxresultado`;
module.exports = Router => {
  const router = new Router({ prefix });

  router.get('/:idpartido', controller.getAllByIdpartido);

  return router;
};

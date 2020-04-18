'use strict';

const controller = require('./partidoxjugador.controller');

const prefix = `/partidoxjugador`;
module.exports = Router => {
  const router = new Router({ prefix });

  router.get('/', controller.getAll);
  // router.get('/:id', controller.getOne);
  router.get('/:idpartido', controller.getAllByIdpartido);
  return router;
};

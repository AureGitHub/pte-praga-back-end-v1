'use strict';

const controller = require('./jugador.controller');

const prefix = `/jugador`;
module.exports = Router => {
  const router = new Router({ prefix });

  router
    .get('/', controller.getAll)
    .get('/:id', controller.getOne)
    .post('/', controller.createOne)
    .put('/', controller.updateOne)
    .delete('/:id', controller.deleteOne);
  return router;
};

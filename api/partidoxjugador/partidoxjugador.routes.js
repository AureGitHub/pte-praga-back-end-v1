'use strict';

const controller = require('./partidoxjugador.controller');

const prefix = `/partidoxjugador`;
module.exports = Router => {
  const router = new Router({ prefix });

  router
    .get('/', controller.getAll)
    .get('/:idpartido', controller.getAllByIdpartido)
    .post('/', controller.createOne)
    .delete('/:id', controller.deleteOne);
  return router;
};

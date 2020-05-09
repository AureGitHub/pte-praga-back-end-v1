'use strict';
const controller = require('./partidoxpistaxmarcador.controller');
const prefix = '/partidoxpistaxmarcador';
module.exports = Router => {
  const router = new Router({ prefix });

  router
    .post('/', controller.createOne)
    .get('/:idpartido', controller.getAllByIdpartido)
    .delete('/:id', controller.deleteOne)
    .put('/', controller.updateOne);

  return router;
};

'use strict';
const controller = require('./partidoxpistaxmarcador.controller');
const prefix = controller.prefix;
module.exports = Router => {
  const router = new Router({ prefix });

  router
    .get('/:idpartido', controller.getAllByIdpartido)
    .post('/', controller.createOne)
    .put('/', controller.updateOne);

  return router;
};

'use strict';

const controller = require('./partidoxjugador.controller');

const prefix = `/partidoxjugador`;
module.exports = Router => {
  const router = new Router({ prefix });

  router
    .get('/', controller.getAll)
    .get('/:idpartido', controller.getAllByIdpartido)
    .get('/AddToPartido/:idpartido', controller.getAllToAddByIdpartido)
    .post('/', controller.createOne)
    .post('/CreateAny', controller.CreateAny)
    .delete('/:id', controller.deleteOne);
  return router;
};

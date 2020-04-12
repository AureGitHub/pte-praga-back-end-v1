'use strict';
const controller = require('./partido.controller');

const prefix = `/partido`;
module.exports = Router => {
  const router = new Router({ prefix });

  router
    .get('/', controller.getAll)
    .get('/public', controller.getAll)
    .get('/:id', controller.getOne)
    .post('/', controller.createOne)
    .put('/', controller.updateOne);
  return router;
};

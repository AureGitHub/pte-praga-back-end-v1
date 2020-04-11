'use strict';

const controller = require('./user.controller');

module.exports = Router => {
  const router = new Router({
    prefix: `/users`,
  });

  router
    .get('/', controller.getAll)
    .post('/', controller.getAll)
    .get('/:userId', controller.getOne)
    .post('/public', controller.createOne);

  return router;
};

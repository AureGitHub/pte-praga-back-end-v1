'use strict';
const controller = require('./partidoxpista.controller');

const prefix = `/partidoxpista`;
module.exports = Router => {
  const router = new Router({ prefix });

  router.get('/:idpartido', controller.getAllByIdpartido);

  return router;
};

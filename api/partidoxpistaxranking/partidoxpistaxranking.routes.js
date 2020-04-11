'use strict';
const controller = require('./partidoxpistaxranking.controller');

const prefix = `/partidoxpistaxranking`;
module.exports = Router => {
  const router = new Router({ prefix });

  router.get('/:idpartido', controller.getAllByIdpartido);

  return router;
};

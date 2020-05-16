'use strict';
const controller = require('./partidoxpistaxjugador.controller');

const prefix = `/partidoxpistaxjugador`;
module.exports = Router => {
  const router = new Router({ prefix });

  router.get('/:idpartido', controller.getAllByIdpartido);
  router.get('/ParejasAleatorio/:idpartido', controller.CreateParejasAleatorio);
  router.get(
    '/ParejasPorRanking/:idpartido',
    controller.CreateParejasPorRanking,
  );

  return router;
};

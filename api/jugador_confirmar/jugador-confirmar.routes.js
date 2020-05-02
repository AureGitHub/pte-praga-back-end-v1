'use strict';
const controller = require('./jugador-confirmar.controller');

const prefix = `/jugadorconfirmar`;
module.exports = Router => {
  const router = new Router({ prefix });
  router.get('/email', controller.getOneEmail);
  router.post('/password/public', controller.getOnePassword);
  router.put('/email', controller.verificarEmail);
  return router;
};

/*
router.get('/partidos_cierre/:id'  ==> Desaparece : se debe utilizar updateOne!!!!
*/

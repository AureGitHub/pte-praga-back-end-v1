'use strict';
const controller = require('./codigos.controller');

const prefix = `/codigos`;
module.exports = Router => {
  const router = new Router({ prefix });

  router.get('/posicion', controller.getAllPosicion);
  router.get('/perfil', controller.getAllPerfil);
  router.get('/jugadorestado', controller.getAllJugadorEstado);
  router.get('/partidoestado', controller.getAllPartidoEstado);

  return router;
};

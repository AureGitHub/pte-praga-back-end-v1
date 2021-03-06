'use strict';

const controller = require('./jugador.controller');

const prefix = `/jugador`;
module.exports = Router => {
  const router = new Router({ prefix });

  router
    .get('/', controller.getAll)
    .get('/ResumenPartidos', controller.getResumenPartidos)
    .get('/ResumenEstadisticas', controller.getResumenEstadisticas)
    .get('/ResumenParejas', controller.getResumenparejas)
    .get('/:id', controller.getOne)
    .post('/', controller.createOne)
    .post('/public', controller.createOne)
    .post('/cambiarpassword', controller.CambiarPassword)
    .post('/cambiarpasswordOlvidada/public', controller.CambiarPasswordOlvidada)
    .put('/', controller.updateOne)
    .delete('/:id', controller.deleteOne);
  return router;
};

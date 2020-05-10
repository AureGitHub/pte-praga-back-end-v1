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
    .delete('/:id', controller.deleteOne)
    .put('/', controller.updateOne)
    .put('/cerrar', controller.cerrarOne)
    .put('/abrir', controller.abrirOne)
    .put('/finalizar', controller.finalizaOne)
    .put('/desfinalizar', controller.desfinalizaOne);
  return router;
};

/*
router.get('/partidos_cierre/:id'  ==> Desaparece : se debe utilizar updateOne!!!!
*/

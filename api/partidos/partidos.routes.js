'use strict';
const controller = require('./partidos.controller');

const prefix = `/partidos`;
module.exports = Router => {
  const router = new Router({ prefix });

  const awaitErorrHandlerFactory = (middleware, prefix_)  => {
    return async (ctx, next) => {
      const { name } = middleware; // nombre del método del controler
      const { method } = ctx; // nombre del método {GET, POST,...}
      const { userInToken } = ctx.state; // user logado
      const prefix = prefix_;

      await middleware(ctx, next);
    };
  };

  router
    .get('/', controller.getAll)
    .get('/public', controller.getAll)
    .post('/', controller.createOne)
    .put('/', controller.updateOne);
  return router;
};

'use strict';
const controller = require('./login.controller');

module.exports = Router => {
  const router = new Router({
    prefix: `/login`,
  });
  router.post('/', controller.login);
  return router;
};

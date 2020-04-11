'use strict';

const fs = require('fs');
const path = require('path');
const Router = require('koa-router');

const { apiVersion } = require('../config').server;
const baseName = path.basename(__filename);

function applyApiMiddleware(app) {
  const router = new Router({
    prefix: `/api/ver${apiVersion}`,
  });

  // Require all the folders and create a sub-router for each feature api
  fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== baseName)
    .forEach(file => {
      try {
        const api = require(path.join(__dirname, file))(Router);
        router.use(api.routes());
      } catch (err) {} // si falla es porque no tiene controller. No hago nada
    });

  app.use(router.routes()).use(router.allowedMethods());
}

module.exports = applyApiMiddleware;

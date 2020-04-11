let { refresh, getData } = require('../utils/token.util');

var secureEntrada = async (ctx, next) => {
  // ctx.throw(500,'Error Message');

  var url = ctx.url;

  // ctx.assert(false, 401, 'No está autorizado para realizar esta operación');
  let userInToken = await getData(ctx);
  // en el login y publico será null
  if (userInToken) {
    ctx.state['userInToken'] = userInToken;
  }

  console.log('entra');
};
var secureSalida = async (ctx, next) => {
  console.log('sale');
  let dataUser = await refresh(ctx);
  // en el login y publico será null
  if (dataUser && ctx.body) {
    ctx.body['dataUser'] = dataUser;
  }
};
module.exports = async (ctx, next) => {
  await secureEntrada(ctx, next);
  await next();
  await secureSalida(ctx, next);
};

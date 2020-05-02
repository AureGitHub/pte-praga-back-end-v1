const jsonwebtoken = require('jsonwebtoken');
var { SessionTime, JWT_SECRET, KeySecure } = require('../config');

exports.generate = async (ctx, user) => {
  let exp = Math.floor(Date.now() / 1000) + SessionTime * 60;

  let token = jsonwebtoken.sign({ data: user, exp }, JWT_SECRET);
  token = `Bearer ${token}`;

  let expire = new Date();
  expire = new Date(expire.setMinutes(expire.getMinutes() + SessionTime));
  // let caducaStr = caduca.toString();

  if (!ctx.body) {
    ctx.body = {};
  }

  const timeout = SessionTime;

  ctx.body[KeySecure] = { user, token, expire, timeout };

  ctx.set(`${KeySecure}`, JSON.stringify({ user, token, expire, timeout }));

  // ctx.set(`${KeySecure}-user`, JSON.stringify(userWithoutidperfil));
  // ctx.set(`${KeySecure}-token`, `Bearer ${token}`);
  // ctx.set(`${KeySecure}-caduca`, caducaStr);
};

exports.refresh = async ctx => {
  try {
    var tokenInHeader = ctx.request.headers[KeySecure];
    if (tokenInHeader) {
      let userToToken = null;
      if (ctx.state['jugadorUpdate']) {
        // el jugador ha modificado sus datos
        userToToken = ctx.state['jugadorUpdate'];
      } else {
        // se obtiene el usuario desde el token
        // habría que verificar que existe en BD
        tokenInHeader = tokenInHeader.replace('Bearer ', '');
        userToToken = jsonwebtoken.verify(tokenInHeader, JWT_SECRET).data;
      }
      if (ctx.state['idestadoNew']) {
        // ha cambiado el estado del jugador
        // cuando confirma su email
        userToToken.idestado = ctx.state['idestadoNew'];
      }

      await this.generate(ctx, userToToken);
    }
  } catch (err) {
    // err NO hago nada... si ha llegado hasta aquí con un token erróneo, es porque está
    // accedindo a un sitio public
  }
  return null;
};

exports.getData = async ctx => {
  try {
    var token = ctx.request.headers[KeySecure];
    if (token) {
      token = token.replace('Bearer ', '');
      var { data } = jsonwebtoken.verify(token, JWT_SECRET);
      return data;
    }
  } catch (err) {
    // err
  }
};

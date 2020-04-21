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
      tokenInHeader = tokenInHeader.replace('Bearer ', '');
      var { data } = jsonwebtoken.verify(tokenInHeader, JWT_SECRET);
      await this.generate(ctx, data);
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

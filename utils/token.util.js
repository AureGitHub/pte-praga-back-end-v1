const jsonwebtoken = require('jsonwebtoken');
var { SessionTime, JWT_SECRET, KeySecure } = require('../config');
const { enumPerfil } = require('./enum.util');

exports.generate = async user => {
  user.IsAdmin = user.idperfil === enumPerfil.admin;
  user.IsJugador = user.idperfil === enumPerfil.jugador;

  const { idperfil, ...userWithoutidperfil } = user;

  let exp = Math.floor(Date.now() / 1000) + SessionTime * 60;
  let token = await jsonwebtoken.sign(
    { data: userWithoutidperfil, exp },
    JWT_SECRET,
  );
  let caduca = new Date();
  caduca = new Date(caduca.setMinutes(caduca.getMinutes() + 30));
  return { user: userWithoutidperfil, token, caduca };
};

exports.refresh = async ctx => {
  try {
    var tokenInHeader = ctx.request.headers[KeySecure];
    if (tokenInHeader) {
      tokenInHeader = tokenInHeader.replace('Bearer ', '');
      var { data } = jsonwebtoken.verify(tokenInHeader, JWT_SECRET);
      let exp = Math.floor(Date.now() / 1000) + SessionTime * 60;
      let token = await jsonwebtoken.sign({ data, exp }, JWT_SECRET);
      let caduca = new Date();
      caduca = new Date(caduca.setMinutes(caduca.getMinutes() + 30));
      return { user: data, token, caduca };
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

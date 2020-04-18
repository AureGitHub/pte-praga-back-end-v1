'use strict';

const db = require('../../database');

let { generate } = require('../../utils/token.util');
let { compare } = require('../../utils/bcrypt.util');

let { assertKOParams } = require('../../utils/error.util');

const { enumPerfil } = require('../../utils/enum.util');

exports.login = async ctx => {
  const { email, password } = ctx.request.body;

  assertKOParams(ctx, email, 'email');
  assertKOParams(ctx, password, 'password');

  const dbUser = await db
    .first([
      'id',
      'alias',
      'nombre',
      'email',
      'idperfil',
      'idestado',
      'passwordhash',
    ])
    .from('jugador')
    .where({ email });

  ctx.assert(dbUser, 404, 'Credenciales incorrectas');

  if (await compare(password, dbUser.passwordhash)) {
    dbUser.IsAdmin = dbUser.idperfil === enumPerfil.admin;
    dbUser.IsJugador = dbUser.idperfil === enumPerfil.jugador;
    const { passwordhash, ...userWithoutPass } = dbUser;
    ctx.status = 200;
    ctx.body = { data: true };
    await generate(ctx, userWithoutPass);
  } else {
    ctx.throw(401, 'Credenciales incorrectas.');
  }
};

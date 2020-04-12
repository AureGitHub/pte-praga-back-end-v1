'use strict';

const db = require('../../database');

let { generate } = require('../../utils/token.util');
let { compare } = require('../../utils/bcrypt.util');

let { assertKOParams } = require('../../utils/error.util');

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
    const { passwordhash, ...userWithoutPass } = dbUser;
    await generate(ctx, userWithoutPass);
    ctx.status = 200;
    ctx.body = 'Credenciales correctas';
  } else {
    ctx.throw(401, 'Credenciales incorrectas.');
  }
};

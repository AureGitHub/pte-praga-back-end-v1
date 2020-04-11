'use strict';

const db = require('../../database');

let { generate } = require('../../utils/token.util');
let { compare } = require('../../utils/bcrypt.util');

exports.login = async ctx => {
  const { email, password } = ctx.request.body;
  ctx.assert(email, 404, 'Debe indicar email');
  ctx.assert(password, 404, 'Debe indicar password');

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
    let { user, token, caduca } = await generate(userWithoutPass);
    let dataUser = { user, token, caduca };
    ctx.status = 200;
    ctx.body = { dataUser };
  } else {
    ctx.throw(401, 'Credenciales incorrectas.');
  }
};

const busEmail = require('../email/bussiness');
const busju = require('../jugador/bussines');
const busOwn = require('./bussiness');
const db = require('../../database');

const { statusOKquery, assertKOParams } = require('../../utils/error.util');
const {
  enumTipoJugadorConfirmacion,
  enumJugadorEstado,
} = require('../../utils/enum.util');

exports.verificarEmail = async function verificarEmail(ctx) {
  const { uuid } = ctx.request.body;
  const { userInToken } = ctx.state;
  assertKOParams(ctx, userInToken.id, 'idUser');
  assertKOParams(ctx, uuid, 'uuid');
  let confirmacion = false;
  await db.transaction(async function(trx) {
    confirmacion = await busOwn.verificarEmail(
      userInToken.id,
      enumTipoJugadorConfirmacion.Email,
      uuid,
      trx,
    );

    if (confirmacion) {
      await busju.updateOne(
        { id: userInToken.id },
        { idestado: enumJugadorEstado.activo },
        trx,
      );
      ctx.state['idestadoNew'] = enumJugadorEstado.activo;
    }
  });

  ctx.status = statusOKquery;
  ctx.body = { data: confirmacion };
};

exports.getOneEmail = async function getOnePassword(ctx) {
  const { userInToken } = ctx.state;
  assertKOParams(ctx, userInToken.id, 'idUser');
  assertKOParams(ctx, userInToken.email, 'email');
  await busEmail.enviarConfirmacionEmail(userInToken.id, userInToken.email);
  ctx.status = statusOKquery;
  ctx.body = { data: true };
};

exports.getOnePassword = async function getOnePassword(ctx) {
  const { email } = ctx.request.body;
  assertKOParams(ctx, email, 'email');
  const jugador = await busju.getOneWhere('id', { email });
  assertKOParams(ctx, jugador || jugador.id, 'El correo no existe');
  await busEmail.enviarConfirmacioPassword(jugador.id, email);
  ctx.status = statusOKquery;
  ctx.body = { data: true };
};

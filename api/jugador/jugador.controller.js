'use strict';

const busOwn = require('./bussines');
const { enumType } = require('../../utils/enum.util');
const {
  statusCreate,
  statusOKquery,
  statusOKSave,
  assertNoData,
  assertKOParams,
} = require('../../utils/error.util');

exports.getAll = async ctx => {
  const { userInToken } = ctx.state;
  ctx.assert(
    userInToken.IsAdmin,
    401,
    'No está autorizado para realizar esta operación',
  );

  const data = await busOwn.getAll();
  ctx.status = statusOKquery;
  ctx.body = { data };
};

// old getById
exports.getOne = async function getOne(ctx) {
  const { userInToken } = ctx.state;
  const id = parseInt(ctx.params.id);
  ctx.assert(userInToken.id === id, 401, 'Solo puede consultar su perfil');
  assertKOParams(ctx, id, 'id');
  const data = await busOwn.getOne(id);
  assertNoData(ctx, data);
  ctx.status = statusOKquery;
  ctx.body = { data };
};

exports.createOne = async function createOne(ctx) {
  const jugador = ctx.request.body;
  const { alias, nombre, idposicion, idperfil, idestado } = jugador;
  assertKOParams(ctx, alias, 'alias');
  assertKOParams(ctx, nombre, 'nombre');
  assertKOParams(ctx, idposicion, 'idposicion', enumType.number);
  assertKOParams(ctx, idperfil, 'idperfil', enumType.number);
  assertKOParams(ctx, idestado, 'idestado', enumType.number);

  if (jugador.hasOwnProperty('id')) {
    delete jugador.id;
  }

  const jugadorIserted = await busOwn.createOne(jugador);

  let data = await busOwn.getAll();
  data = data.filter(a => a.id === jugadorIserted.id);
  data = data[0];
  ctx.status = statusCreate;

  // devolverlo para insertarlo en la lista de usuario

  ctx.body = { data };
};

exports.updateOne = async function updateOne(ctx) {
  let { userInToken } = ctx.state;
  const jugador = ctx.request.body;
  const { id, alias, nombre, idposicion } = jugador;

  const desdedDetallejugador = jugador.hasOwnProperty('detallejugador');

  if (desdedDetallejugador) {
    // seguridad
    ctx.assert(
      userInToken.IsAdmin || id === userInToken.id,
      401,
      'No puede modiciar los datos de otro jugador',
    );
    // viene de detalle-jugador Hay que:
    // 1.- Modificar el usuario (ojo, no todos los datos)
    // 2.- regenerar el token
    delete jugador.detallejugador;
  } else {
    // Modificación desde la parte de jugador por parte del adminsitrador
    // se modifican todos los datos
    ctx.assert(
      userInToken.IsAdmin,
      401,
      'Debe ser administador para modiciar los datos de otro usuario',
    );
    const { idperfil, idestado } = jugador;
    assertKOParams(ctx, idperfil, 'idperfil', enumType.number);
    assertKOParams(ctx, idestado, 'idestado', enumType.number);
  }

  assertKOParams(ctx, id, 'id', enumType.number);
  assertKOParams(ctx, alias, 'alias');
  assertKOParams(ctx, nombre, 'nombre');
  assertKOParams(ctx, idposicion, 'idposicion', enumType.number);

  await busOwn.updateOne({ id: jugador.id }, jugador);
  ctx.status = statusOKSave;
  ctx.body = { data: jugador };
  if (desdedDetallejugador) {
    let dbUser = await busOwn.getOne(id);
    ctx.state['jugadorUpdate'] = dbUser;
    ctx.status = 200;
    ctx.body = { data: true };
  }
};

exports.deleteOne = async function deleteOne(ctx) {
  const { id } = ctx.params;
  assertKOParams(ctx, id, 'id');
  await busOwn.delByWhere({ id });
  ctx.status = statusOKSave;
  ctx.body = { data: parseInt(id) };
};

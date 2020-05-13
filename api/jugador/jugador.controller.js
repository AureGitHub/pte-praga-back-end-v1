'use strict';

const db = require('../../database');
const busOwn = require('./bussines');
const busEmail = require('../email/bussiness');
const busjuco = require('../jugador_confirmar/bussiness');
const { enumJugadorEstado, enumPerfil } = require('../../utils/enum.util');
const { enumType } = require('../../utils/enum.util');
var { JugadorPasswordDefalult } = require('../../config');
const bcrypt = require('../../utils/bcrypt.util');
const { generate } = require('../../utils/token.util');
let { compare } = require('../../utils/bcrypt.util');

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
  const { alias, email, nombre, idposicion } = ctx.request.body;
  assertKOParams(ctx, alias, 'alias');
  assertKOParams(ctx, email, 'alias');
  assertKOParams(ctx, nombre, 'nombre');
  assertKOParams(ctx, idposicion, 'idposicion', enumType.number);

  let idperfil = null;
  let idestado = null;
  let password = null;

  const makingRegistro = ctx.request.body.hasOwnProperty('registrojugador');
  if (makingRegistro) {
    // viene desde el registro
    idperfil = enumPerfil.jugador;
    idestado = enumJugadorEstado.debeConfEmail;
    password = ctx.request.body['password'];
    assertKOParams(ctx, password, 'password');
  } else {
    // viene desde el alta de la administación de jugadores
    idperfil = ctx.request.body['idperfil'];
    idestado = ctx.request.body['idestado'];
    assertKOParams(ctx, idperfil, 'idperfil', enumType.number);
    assertKOParams(ctx, idestado, 'idestado', enumType.number);
    password = JugadorPasswordDefalult;
  }

  const passwordhash = await bcrypt.hash(password);

  const jugador = {
    alias,
    email,
    nombre,
    idposicion,
    idperfil,
    idestado,
    passwordhash,
  };
  const jugadorIserted = await busOwn.createOne(jugador);

  let data = null;

  if (makingRegistro) {
    data = await busOwn.getOne(jugadorIserted.id); // datos para el token
  } else {
    // datos para añadir a la lista de jugadores
    data = await busOwn.getAll();
    data = data.filter(a => a.id === jugadorIserted.id);
    data = data[0];
  }

  ctx.status = statusCreate;
  ctx.body = { data };
  if (makingRegistro) {
    await generate(ctx, data); // genero el token
    await busEmail.enviarConfirmacionEmail(data.id, data.email);
    // envío correo
  }
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

exports.CambiarPasswordOlvidada = async function CambiarPasswordOlvidada(ctx) {
  const { uuid, password } = ctx.request.body;
  assertKOParams(ctx, uuid, 'uuid');
  assertKOParams(ctx, password, 'password');
  let idjugador = null;
  await db.transaction(async function(trx) {
    const confirmacion = await busjuco.verificarByuuid(uuid, trx);
    assertKOParams(ctx, confirmacion, 'Código de confirmación incorrecto');
    const passwordhash = await bcrypt.hash(password);
    await busOwn.updateOne(
      { id: confirmacion.idjugador },
      { passwordhash },
      trx,
    );
    idjugador = confirmacion.idjugador;
  });

  const data = await busOwn.getOne(idjugador);
  ctx.body = { data };
  ctx.status = statusCreate;
  await generate(ctx, data);
};

exports.CambiarPassword = async function CambiarPassword(ctx) {
  const { oldpassword, password } = ctx.request.body;
  assertKOParams(ctx, oldpassword, 'oldpassword');
  assertKOParams(ctx, password, 'password');
  const { userInToken } = ctx.state;
  assertKOParams(
    ctx,
    userInToken,
    'no se pueden obtener los datos del usuario',
  );

  const jugador = await busOwn.getOneWhere(['passwordhash', 'idestado'], {
    id: userInToken.id,
  });

  if (await compare(oldpassword, jugador.passwordhash)) {
    const passwordhash = await bcrypt.hash(password);
    let update = { passwordhash };
    if (jugador.idestado === enumJugadorEstado.debeCambiarPass) {
      const idestado = enumJugadorEstado.activo;
      update = { passwordhash, idestado };
      ctx.state['idestadoNew'] = enumJugadorEstado.activo;
    }
    await busOwn.updateOne({ id: userInToken.id }, update);
    ctx.status = 200;
    ctx.body = { data: true };
  } else {
    assertKOParams(ctx, false, 'Contraseña antigua incorrecto');
  }
};

'use strict';

const db = require('../../database');
const busOwn = require('./bussines');
const buspaxpixma = require('../partidoxpistaxmarcador/bussines');
const buspaxpi = require('../partidoxpistaxjugador/bussines');
const buspaxpa = require('../partidoxpareja/bussines');
const buspaxju = require('../partidoxjugador/bussines');
const juxra = require('../jugadorxranking/bussines');

const {
  statusCreate,
  statusOKquery,
  statusOKSave,
  assertNoData,
  assertKOParams,
} = require('../../utils/error.util');

const { enumPartidoEstado, enumType } = require('../../utils/enum.util');
exports.getAll = async ctx => {
  let { userInToken } = ctx.state;
  const data = await busOwn.getAll(userInToken ? userInToken.id : -1);
  ctx.status = statusOKquery;
  ctx.body = { data };
};

// old getById
exports.getOne = async function getOne(ctx) {
  const id = ctx.params.id;
  assertKOParams(ctx, id, 'id', enumType.number);
  const data = await busOwn.getOne(id);
  assertNoData(ctx, data);
  ctx.status = statusOKquery;
  ctx.body = { data };
};

exports.createOne = async function createOne(ctx) {
  const NewPartido = ctx.request.body;
  const { idcreador, dia, duracion, pistas, turnos } = ctx.request.body;
  assertKOParams(ctx, idcreador, 'idcreador', enumType.number);
  assertKOParams(ctx, dia, 'dia');
  assertKOParams(ctx, duracion, 'duracion', enumType.number);
  assertKOParams(ctx, pistas, 'pistas', enumType.number);
  assertKOParams(ctx, turnos, 'turnos', enumType.number);

  if (pistas === 1 && turnos !== 1) {
    assertKOParams(
      ctx,
      false,
      'Si solo hay una pista, solo puede haber 1 turno',
    );
  }

  let data = null;
  await db.transaction(async function(trx) {
    data = await busOwn.createOne(NewPartido, trx);
    await buspaxpi.CreatePistas(data.id, pistas, turnos, trx);
  });

  ctx.status = statusCreate;
  ctx.body = { data };
};

exports.deleteOne = async function deleteOne(ctx) {
  const { id } = ctx.params;
  assertKOParams(ctx, id, 'id', enumType.number);
  let nDel = 0;
  await db.transaction(async function(trx) {
    await buspaxpixma.delByWhere({ idpartido: id }, trx);
    await buspaxpi.delByWhere({ idpartido: id }, trx);
    await buspaxpa.delByWhere({ idpartido: id }, trx);
    await buspaxju.delByWhere({ idpartido: id }, trx);
    nDel = await busOwn.delByWhere({ id }, trx);
  });
  ctx.status = statusOKSave;
  ctx.body = { data: nDel === 1 };
};

exports.updateOne = async function updateOne(ctx) {
  let { userInToken } = ctx.state;

  const partido = ctx.request.body;
  const { id, idcreador, dia, duracion, pistas, turnos } = ctx.request.body;

  assertKOParams(ctx, id, 'id', enumType.number);
  assertKOParams(ctx, idcreador, 'idcreador', enumType.number);
  assertKOParams(ctx, dia, 'dia');
  assertKOParams(ctx, duracion, 'duracion', enumType.number);
  assertKOParams(ctx, pistas, 'pistas', enumType.number);
  assertKOParams(ctx, turnos, 'turnos', enumType.number);
  if (pistas === 1 && turnos !== 1) {
    assertKOParams(
      ctx,
      false,
      'Si solo hay una pista, solo puede haber 1 turno',
    );
  }
  ctx.assert(
    userInToken.IsAdmin || idcreador === userInToken.id,
    401,
    'No está autorizado para realizar esta operación',
  );

  const oldPartido = await db('partido')
    .first(['pistas', 'turnos'])
    .where({ id });

  const message = `no se ecuentra el partido con id ${id}`;
  assertNoData(ctx, oldPartido, message);

  partido.jugadorestotal = parseInt(partido.pistas) * 4;
  await db.transaction(async function(trx) {
    await buspaxpixma.delByWhere({ idpartido: id }, trx);
    await buspaxpi.delByWhere({ idpartido: id }, trx);
    await buspaxpa.delByWhere({ idpartido: id }, trx);
    await buspaxju.GestionSuplentes(oldPartido, partido, trx);
    await busOwn.updateOne({ id: partido.id }, partido);
    if (oldPartido.pistas !== pistas || oldPartido.turnos !== turnos) {
      await buspaxpi.CreatePistas(partido.id, pistas, turnos, trx);
    }
  });

  let data = await await busOwn.getOne(id);

  ctx.status = statusOKSave;
  ctx.body = { data };
};

exports.cerrarOne = async ctx => {
  const { id } = ctx.request.body;
  assertKOParams(ctx, id, 'id', enumType.number);
  await busOwn.updateOne(
    { id },
    { idpartido_estado: enumPartidoEstado.cerrado },
  );
  const data = await await busOwn.getOne(id);
  ctx.status = statusOKSave;
  ctx.body = { data };
};

exports.abrirOne = async ctx => {
  const { id } = ctx.request.body;
  assertKOParams(ctx, id, 'id', enumType.number);
  await db.transaction(async function(trx) {
    await busOwn.updateOne(
      { id },
      { idpartido_estado: enumPartidoEstado.abierto },
    );
    await buspaxpixma.delByWhere({ idpartido: id }, trx);
  });
  ctx.status = statusOKSave;
  const data = await await busOwn.getOne(id);
  ctx.body = { data };
};

exports.finalizaOne = async ctx => {
  const { id } = ctx.request.body;
  assertKOParams(ctx, id, 'id', enumType.number);

  let partido = await busOwn.getOne(id);

  const jugadorxmarcador = await buspaxpi.GetInfomeByPartido(
    id,
    partido.turnos,
  );

  await db.transaction(async function(trx) {
    const toUpdate = { idpartido_estado: enumPartidoEstado.finalizado };
    await busOwn.updateOne({ id }, toUpdate);
    for (var index = 0; index < jugadorxmarcador.length; index++) {
      await juxra.createOne(jugadorxmarcador[index], trx);
    }
  });
  partido = await busOwn.getOne(id);
  ctx.status = statusOKSave;
  ctx.body = { data: partido };
};

exports.desfinalizaOne = async ctx => {
  const { id } = ctx.request.body;
  assertKOParams(ctx, id, 'id', enumType.number);

  await db.transaction(async function(trx) {
    const toUpdate = { idpartido_estado: enumPartidoEstado.cerrado };
    await busOwn.updateOne({ id }, toUpdate);
    await juxra.delByWhere({ idpartido: id }, trx);
  });

  const partido = await busOwn.getOne(id);
  ctx.status = statusOKSave;
  ctx.body = { data: partido };
};

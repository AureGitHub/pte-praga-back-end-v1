'use strict';

const db = require('../../database');
const busOwn = require('./bussines');
const buspaxpixma = require('../partidoxpistaxmarcador/bussines');
const buspaxpi = require('../partidoxpista/bussines');
const buspaxpa = require('../partidoxpareja/bussines');
const buspaxju = require('../partidoxjugador/bussines');
const buspaxpixra = require('../partidoxpistaxranking/bussines');

const {
  statusCreate,
  statusOKquery,
  statusOKSave,
  assertNoData,
  assertKOParams,
} = require('../../utils/error.util');

const { enumPartidoEstado } = require('../../utils/enum.util');
exports.getAll = async ctx => {
  let { userInToken } = ctx.state;
  const data = await busOwn.getAll(userInToken ? userInToken.id : -1);
  ctx.status = statusOKquery;
  ctx.body = { data };
};

// old getById
exports.getOne = async function getOne(ctx) {
  const id = ctx.params.id;
  assertKOParams(ctx, id, 'id');
  const data = await busOwn.getOne(id);
  assertNoData(ctx, data);
  ctx.status = statusOKquery;
  ctx.body = { data };
};

exports.createOne = async function createOne(ctx) {
  const NewPartido = ctx.request.body;
  const { idcreador, dia, duracion, pistas } = ctx.request.body;
  assertKOParams(ctx, idcreador, 'idcreador');
  assertKOParams(ctx, dia, 'dia');
  assertKOParams(ctx, duracion, 'duracion');
  assertKOParams(ctx, pistas, 'pistas');
  const data = await busOwn.createOne(NewPartido);
  ctx.status = statusCreate;
  ctx.body = { data };
};

exports.deleteOne = async function deleteOne(ctx) {
  const { id } = ctx.params;
  assertKOParams(ctx, id, 'id');
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
  const { id, idcreador, dia, duracion, pistas } = ctx.request.body;

  assertKOParams(ctx, id, 'id');
  assertKOParams(ctx, idcreador, 'idcreador');
  assertKOParams(ctx, dia, 'dia');
  assertKOParams(ctx, duracion, 'duracion');
  assertKOParams(ctx, pistas, 'pistas');

  // seguridad
  ctx.assert(
    userInToken.IsAdmin || idcreador === userInToken.id,
    401,
    'No está autorizado para realizar esta operación',
  );

  const oldPartido = await db('partido')
    .first('pistas')
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
  });

  ctx.status = statusOKSave;
  ctx.body = { data: partido };
};

exports.finalizaOne = async ctx => {
  const partido = ctx.request.body;
  const { id } = partido;
  assertKOParams(ctx, id, 'id');

  await db.transaction(async function(trx) {
    const toUpdate = { idpartido_estado: enumPartidoEstado.finalizado };
    await busOwn.updateOne({ id }, toUpdate);
    await buspaxpixra.updateFinalizaOne(id, trx);
  });

  ctx.status = statusOKSave;
  ctx.body = { data: partido };
};

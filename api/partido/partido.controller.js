'use strict';

const db = require('../../database');
const busOwn = require('./bussines');
const buspaxpixma = require('../partidoxpistaxmarcador/bussines');
const buspaxpi = require('../partidoxpistaxjugador/bussines');
const buspaxju = require('../partidoxjugador/bussines');
const juxre = require('../jugadorxresultado/bussines');
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

function compare(a, b) {
  if (a.coeficiente < b.coeficiente) return 1;
  if (b.coeficiente < a.coeficiente) return -1;

  return 0;
}

const RecalcularCoeficiente = async function(trx) {
  // me tengo que currar la query para que me lo de agrupado por jugador
  const lstResultados = await juxre.getAll(trx);

  // para cada jugador, calcular su ranking
  // (pg / pj ) * 10  +  0,1 * (jg - gp)

  let jugadoresxcoeficiente = [];

  lstResultados.forEach(jugador => {
    // partidos Ganados / partidos jugados X 10
    let coeficiente =
      (parseInt(jugador.partidog) / parseInt(jugador.partidos)) * 10;
    // suma/resta 0.1 por diferiencia total de juegos
    coeficiente +=
      0.1 * (parseInt(jugador.juegosg) - parseInt(jugador.juegosp));
    jugadoresxcoeficiente.push({ idjugador: jugador.idjugador, coeficiente });
    // suma 0.2 por "fidelidad" (partidos jugados)
    coeficiente += 0.1 * jugador.partidos;
  });

  // borrar le ranking
  await juxra.deleteAll(trx);
  // ordenar la lista desc según coeficiente
  // insertar en ese orden incrementando la posicion (empezando en 1)

  jugadoresxcoeficiente.sort(compare);

  for (var index = 0; index < jugadoresxcoeficiente.length; index++) {
    const posicion = index + 1;
    const { idjugador, coeficiente } = jugadoresxcoeficiente[index];
    const item = { idjugador, coeficiente, posicion };
    await juxra.createOne(item, trx);
  }
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
      await juxre.createOne(jugadorxmarcador[index], trx);
    }
    await RecalcularCoeficiente(trx);
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
    await juxre.delByWhere({ idpartido: id }, trx);
    await RecalcularCoeficiente(trx);
  });

  const partido = await busOwn.getOne(id);
  ctx.status = statusOKSave;
  ctx.body = { data: partido };
};

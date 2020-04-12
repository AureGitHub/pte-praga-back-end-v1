'use strict';

const db = require('../../database');
const controller = require('../index.controller');

const {
  statusCreate,
  statusOKquery,
  statusOKSave,
  assertNoData,
  assertKOParams,
} = require('../../utils/error.util');

const { enumPartidoEstado } = require('../../utils/enum.util');

const tablename = 'partido';

exports.getAll = async ctx => {
  let { userInToken } = ctx.state;
  const sql = `select 
  p.id,
  p.idcreador,
  p.idpartido_estado,
  to_char("dia", 'DD/MM/YYYY HH24:MI') as dia,    
  p.duracion,
  p.pistas,
  p.jugadorestotal,
  p.jugadoresapuntados,
  pj.id as idpartidoxjugador
  from partido p
  left join partidoxjugador pj on p.id = pj.idpartido and pj.idjugador = ?
  order by p.id desc`;
  let data = await controller.generic.getAllquery(
    sql,
    userInToken ? userInToken.id : -1,
  );

  ctx.status = statusOKquery;
  ctx.body = { data };
};

// old getById
exports.getOne = async function getOne(ctx) {
  const id = ctx.params.id;
  assertKOParams(ctx, id, 'id');

  const sql = `select 
  p.id,
  p.idcreador,
  p.idpartido_estado,
  to_char("dia", 'DD/MM/YYYY HH24:MI') as dia,    
  p.duracion,
  p.pistas,
  p.jugadorestotal,
  p.jugadoresapuntados   
  from partido p
  where id=?`;

  let data = await controller.generic.getOnequery(sql, id);
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

  NewPartido.jugadorestotal = parseInt(NewPartido.pistas) * 4;
  delete NewPartido.id;
  NewPartido.jugadoresapuntados = 0;
  NewPartido['idpartido_estado'] = 1;
  let accessBD = await db(tablename)
    .returning('id')
    .insert(NewPartido);

  NewPartido['id'] = accessBD[0];

  ctx.status = statusCreate;
  ctx.body = { data: NewPartido };
};

exports.deleteOne = async function deleteOne(ctx) {
  const { id } = ctx.params;
  assertKOParams(ctx, id, 'id');

  let nDel = 0;
  await db.transaction(async function(trx) {
    try {
      await controller.paxpixma.delByIdpartido(id, trx);
      await controller.paxpi.delByIdpartido(id, trx);
      await controller.paxpa.delByIdpartido(id, trx);
      await controller.paxju.delByIdpartido(id, trx);
      nDel = await controller.generic.delByWhere(tablename, { id }, trx);
    } catch (err) {
      await ctx.throw(401, err.message);
    }
  });
  ctx.status = statusOKSave;
  ctx.body = { data: nDel === 1 };
};

var gestionSuplentes = async (oldPartido, partido, trx) => {
  if (parseInt(oldPartido.pistas) < parseInt(partido.pistas)) {
    // pasar suplentes a Aceptados
    const cuantosSuplentesAscientes =
      (parseInt(partido.pistas) - parseInt(oldPartido.pistas)) * 4;

    await controller.paxju.SuplentesAceptados(
      trx,
      partido.id,
      cuantosSuplentesAscientes,
    );
  } else if (parseInt(oldPartido.pistas) > parseInt(partido.pistas)) {
    // pasar Aceptados a suplentes
    // order descendente. LIFO
    await controller.paxju.AceptadosSuplentes(
      trx,
      partido.id,
      parseInt(partido.pistas) * 4,
    );
  }
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
    await controller.paxpixma.delByIdpartido(id, trx);
    await controller.paxpi.delByIdpartido(id, trx);
    await controller.paxpa.delByIdpartido(id, trx);
    await gestionSuplentes(oldPartido, partido, trx);
    await controller.generic.updateOne(tablename, { id: partido.id }, partido);
    // await trx('partido')
    //   .where({ id: partido.id })
    //   .update(partido);
  });

  ctx.status = statusOKSave;
  ctx.body = { data: partido };
};

exports.finalizaOne = async ctx => {
  const partido = ctx.request.body;
  const { id } = partido;
  partido.idpartido_estado = enumPartidoEstado.finalizado;
  assertKOParams(ctx, id, 'id');

  await db.transaction(async function(trx) {
    await controller.generic.updateOne(tablename, { id }, partido);
    controller.paxpixra.updateFinalizaOne(trx, id);
  });

  ctx.status = statusOKSave;
  ctx.body = { data: partido };
};

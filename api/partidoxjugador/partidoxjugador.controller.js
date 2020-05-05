const db = require('../../database');
const busOwn = require('./bussines');
const busPartido = require('../partido/bussines');
const buspaxpixma = require('../partidoxpistaxmarcador/bussines');
const buspaxpi = require('../partidoxpistaxjugador/bussines');
const buspaxpa = require('../partidoxpareja/bussines');
const busju = require('../jugador/bussines');

const { enumType } = require('../../utils/enum.util');

const {
  statusCreate,
  statusOKquery,
  statusOKSave,
  assertKOParams,
} = require('../../utils/error.util');

exports.getAll = async ctx => {
  const data = await busOwn.getAll();
  ctx.status = statusOKquery;
  ctx.body = { data };
};

exports.getOne = async ctx => {
  const id = ctx.params.id;
  assertKOParams(ctx, id, 'id', enumType.number);
  const data = await busOwn.getOne(id);
  ctx.status = statusOKquery;
  ctx.body = { data };
};

exports.getAllByIdpartido = async ctx => {
  const { idpartido } = ctx.params;
  assertKOParams(ctx, idpartido, 'idpartido');
  const data = await busOwn.getAllByIdpartido(idpartido);
  ctx.status = statusOKSave;
  ctx.body = { data };
};

exports.getAllToAddByIdpartido = async ctx => {
  const { idpartido } = ctx.params;
  assertKOParams(ctx, idpartido, 'idpartido');
  const jugadoresApuntados = await busOwn.getAllByIdpartido(idpartido);
  const jugadoresTodos = await busju.getAll();

  const data = jugadoresTodos.filter(
    a => !jugadoresApuntados.find(b => b.id === a.id),
  );

  ctx.status = statusOKSave;
  ctx.body = { data };
};

var createOne_ = async function(idpartido, idjugador) {
  const jugadorestotal = await busPartido.getTotalJugadores(idpartido);
  const jugadoresAceptados = await busOwn.getAceptadosCount(idpartido);

  let item = { idpartido, idjugador };

  item['idpartidoxjugador_estado'] = busOwn.SetEstado(
    jugadorestotal,
    jugadoresAceptados,
  );

  await db.transaction(async function(trx) {
    await busOwn.createOne(item);
    await busPartido.IncrementOne(idpartido, 1, trx);
  });
};

exports.createOne = async function createOne(ctx) {
  const { idpartido, idjugador } = ctx.request.body;
  assertKOParams(ctx, idpartido, 'idpartido', enumType.number);
  assertKOParams(ctx, idjugador, 'idjugador', enumType.number);
  await createOne_(idpartido, idjugador);
  ctx.status = statusCreate;
  ctx.body = { data: true };
};

exports.CreateAny = async function createOne(ctx) {
  const { idpartido, JugadoresAdd } = ctx.request.body;

  assertKOParams(ctx, idpartido, 'idpartido', enumType.number);
  assertKOParams(ctx, JugadoresAdd, 'JugadoresAdd');

  for (let index = 0; index < JugadoresAdd.length; index++) {
    const idjugador = JugadoresAdd[index].id;
    await createOne_(idpartido, idjugador);
  }

  // voy a hacer que devuelva la lista de jugadores
  const data = await busOwn.getAllByIdpartido(idpartido);

  ctx.status = statusCreate;
  ctx.body = { data };
};

exports.deleteOne = async (ctx, next) => {
  const { id } = ctx.params;
  assertKOParams(ctx, id, 'id', enumType.number);

  const partidoxjugadoABorrar = await busOwn.getOne(id);

  const { idpartido, idjugador } = partidoxjugadoABorrar;

  await db.transaction(async function(trx) {
    // no tengo claro borrar estas tres tablas... lo hago para rehacer parejas...
    await buspaxpixma.delByWhere({ idpartido }, trx);
    await buspaxpi.delByWhere({ idpartido }, trx);
    await buspaxpa.delByWhere({ idpartido }, trx);

    await busOwn.delByWhere({ idjugador, idpartido }, trx);
    await busPartido.IncrementOne(idpartido, -1, trx);

    if (partidoxjugadoABorrar.idpartidoxjugador_estado === 1) {
      // se ha borrado uno aceptado, hay que "subir" a un suplente

      await busOwn.AsciendePrimerSuplente(idpartido);
    }
  });

  // devuelvo todos los jugadores apuntados.
  // este método se llama para borrase (no tiene sentido que devuelva esto, no pasa nada)
  // y desde la gestión de jugadores en el partido para borrar de la lista
  const data = await busOwn.getAllByIdpartido(idpartido);

  ctx.status = statusCreate;
  ctx.body = { data };
};

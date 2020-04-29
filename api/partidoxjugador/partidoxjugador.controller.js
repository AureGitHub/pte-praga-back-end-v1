const db = require('../../database');
const busOwn = require('./bussines');
const busPartido = require('../partido/bussines');
const buspaxpixma = require('../partidoxpistaxmarcador/bussines');
const buspaxpi = require('../partidoxpista/bussines');
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

exports.createOne = async function createOne(ctx) {
  let item = ctx.request.body;
  const { idpartido, idjugador } = item;
  assertKOParams(ctx, idpartido, 'idpartido', enumType.number);
  assertKOParams(ctx, idjugador, 'idjugador', enumType.number);

  const jugadorestotal = await busPartido.getTotalJugadores(idpartido);
  const jugadoresAceptados = await busOwn.getAceptadosCount(idpartido);

  item['idpartidoxjugador_estado'] = busOwn.SetEstado(
    jugadorestotal,
    jugadoresAceptados,
  );

  await db.transaction(async function(trx) {
    await busOwn.createOne(item);
    await busPartido.IncrementOne(idpartido, 1, trx);
  });

  ctx.status = statusCreate;
  ctx.body = { data: true };
};

exports.deleteOne = async (ctx, next) => {
  let { userInToken } = ctx.state;

  const idjugador = userInToken.id;
  const idpartido = ctx.params.id;

  assertKOParams(ctx, idpartido, 'idpartido', enumType.number);
  assertKOParams(ctx, idjugador, 'idjugador', enumType.number);

  const partidoxjugadoABorrar = await busOwn.getOneByPartidoJugador(
    idpartido,
    idjugador,
  );

  await db.transaction(async function(trx) {
    try {
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
    } catch (err) {
      await ctx.throw(401, err.message);
    }
  });

  ctx.status = statusCreate;
  ctx.body = { data: true };
};

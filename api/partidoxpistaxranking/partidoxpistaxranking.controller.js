// const db = require('../../database');
const { genericController } = require('../../database/generic.controller');
const { statusOKquery, assertKOParams } = require('../../utils/error.util');

// old getpartidoxpistaxrankingByIdpartido
exports.getAllByIdpartido = async ctx => {
  const { idpartido } = ctx.params;

  assertKOParams(ctx, idpartido, 'idpartido');

  const sql = `
  select drive.alias drive, reves.alias reves, sum(gana) ganados, sum(juegos) juegos
  from partidoxpistaxranking ppr
  inner join jugador drive on ppr.iddrive = drive.id
  inner join jugador reves on ppr.idreves = reves.id
  where ppr.idpartido = ?
  group by drive, reves
  order by ganados desc, juegos desc`;

  const data = await genericController.getAllquery(sql, [idpartido]);
  ctx.status = statusOKquery;
  ctx.body = { data };
};

const db = require('../../database');
const { genericController } = require('../../database/generic.controller');
const {
  partidoxpistaxmarcadorController,
} = require('../partidoxpistaxmarcador/partidoxpistaxmarcador.controller');

const { statusOKSave, assertKOParams } = require('../../utils/error.util');

// old getpartidoxpistaByIdpartido
exports.getAllByIdpartido = async ctx => {
  const { idpartido } = ctx.params;

  await assertKOParams(ctx, idpartido, 'idpartido');
  const sql = `select 
  pxpi.id,
  pxpi.nombre,
  coalesce(jd1.alias,'jd1') jd1,
  coalesce(jr1.alias,'jr1') jr1,
  coalesce(jd2.alias,'jd2') jd2,
  coalesce(jr2.alias,'jr2') jr2,
  pxpi.idpista,
  pxpi.idturno
  from partidoxpista pxpi
  left join  partidoxpareja pxpa1 on pxpi.idpartidoxpareja1 = pxpa1.id
  left join  partidoxpareja pxpa2 on pxpi.idpartidoxpareja2 = pxpa2.id
  left join jugador jd1 on pxpa1.iddrive= jd1.id
  left join jugador jr1 on pxpa1.idreves= jr1.id
  left join jugador jd2 on pxpa2.iddrive= jd2.id
  left join jugador jr2 on pxpa2.idreves= jr2.id  
  where pxpi.idpartido=?
  order by idturno,idpista`;

  const data = await genericController.getAllquery(sql, [idpartido]);

  // todos los marcadores de todos los partidos del partido
  const marcadores = await partidoxpistaxmarcadorController.getAllByIdpartido(
    idpartido,
  );

  data.forEach(element => {
    let susMarcadores = marcadores.filter(
      a => a.idpartidoxpista === element.id,
    );

    susMarcadores.forEach(marcador => {
      element[`set${marcador.idset}`] = marcador;
    });

    // element['marcador'] = marcadores.filter(a=> a.idpartidoxpista === element.id);
  });

  ctx.status = statusOKSave;
  ctx.body = { data };
};

exports.partidoxmarcadorController = {
  deleteOne: async (id, trx = null) => {
    if (trx) {
      await trx('partidoxpista')
        .where({ id })
        .del();
    } else {
      await db('partidoxpista')
        .where({ id })
        .del();
    }
  },

  deleteOneByIdpartido: async (idpartido, trx = null) => {
    if (trx) {
      await trx('partidoxpista')
        .where({ idpartido })
        .del();
    } else {
      await db('partidoxpista')
        .where({ idpartido })
        .del();
    }
  },
};

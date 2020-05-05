const { genericController } = require('../../database/generic.controller');
const tablename = 'partidoxpista';

var delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};
exports.delByWhere = delByWhere;
// para pubicar
exports.getAllByIdpartido = async idpartido => {
  const sql = `select 
  pxpi.id,
  pxpi.nombre,
  coalesce(jd1.alias,'jd1') jd1,
  coalesce(jd2.alias,'jr1') jr1,
  coalesce(jd3.alias,'jd2') jd2,
  coalesce(jd4.alias,'jr2') jr2, 
  pxpi.idpista,
  pxpi.idturno
  from partidoxpista pxpi  
  left join jugador jd1 on pxpi.idjugadordrive1 = jd1.id
  left join jugador jd2 on pxpi.idjugadorreves1 = jd2.id
  left join jugador jd3 on pxpi.idjugadordrive2 = jd3.id
  left join jugador jd4 on pxpi.idjugadorreves2 = jd4.id  
  where pxpi.idpartido=?
  order by idturno,idpista`;
  return genericController.getAllquery(sql, idpartido);
};

var createOne = async function(item, trx = null) {
  var data = await genericController.createOne(tablename, item, trx);
  return data;
};

exports.CreatePistas = async function(idpartido, pistas, turnos, trx) {
  await delByWhere({ idpartido }, trx);
  for (var idturno = 1; idturno <= turnos; idturno++) {
    for (var idpista = 1; idpista <= pistas; idpista++) {
      const nombre = `Partido_T${idturno}_P${idpista}`;
      await createOne({ idpartido, idturno, idpista, nombre }, trx);
    }
  }
};

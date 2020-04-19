const { genericController } = require('../../database/generic.controller');
const tablename = 'partidoxpista';

exports.delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};

exports.getAllByIdpartido = async idpartido => {
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
  return genericController.getAllquery(sql, idpartido);
};

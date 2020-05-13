const { genericController } = require('../../database/generic.controller');
const tablename = 'jugadorxranking';

exports.getAll = async idpartido => {
  const sql = `
  select 
ju.alias,
coeficiente,
posicion
from jugadorxranking jr 
inner join jugador ju on jr.idjugador = ju.id  
order by coeficiente desc`;
  return genericController.getAllquery(sql, [idpartido]);
};

exports.createOne = async function createOne(item, trx = null) {
  item = await genericController.createOne(tablename, item, trx);
  return item;
};

exports.deleteAll = async function(trx) {
  return genericController.deleteAll(tablename, trx);
};

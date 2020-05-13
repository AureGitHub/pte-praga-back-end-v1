const { genericController } = require('../../database/generic.controller');
const tablename = 'jugadorxresultado';

exports.getAll = async function() {
  return genericController.getAll(tablename, '*');
};

exports.getAllByIdpartido = async idpartido => {
  const sql = `
  select 
ju.alias,
partidog pg,
partidop pp,
juegosg jg,
juegosp  jp
from jugadorxresultado jr 
inner join jugador ju on jr.idjugador = ju.id  
where jr.idpartido  = ?
order by partidog desc, partidop asc, juegosg-juegosp desc, juegosg desc, juegosp desc, alias  asc`;
  return genericController.getAllquery(sql, [idpartido]);
};

exports.createOne = async function createOne(item, trx = null) {
  item = await genericController.createOne(tablename, item, trx);
  return item;
};

exports.delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};

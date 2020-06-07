const { genericController } = require('../../database/generic.controller');
const tablename = 'jugadorxranking';

exports.getAll = async idpartido => {
  const sql = `
  select 
  posicion ,
  alias,
  coeficiente ,
  partidos,
  partidosG,
  DiffJuegos
  from 
  (select 
  idjugador,
  jr.posicion,
  j.alias ,
  jr.coeficiente
  from jugadorxranking jr
  inner join jugador j on jr.idjugador = j.id
  ) coeficiente
  inner join
  (select 
  idjugador,
  sum(partidos) partidos,
  sum(partidog) partidosG,
  sum(juegosg) -  sum(juegosp) DiffJuegos
  from jugadorxresultado j
  group by idjugador 
  )Marcador on Coeficiente.idjugador = Marcador.idjugador
  order by coeficiente desc  
  `;
  return genericController.getAllquery(sql);
};

exports.createOne = async function createOne(item, trx = null) {
  item = await genericController.createOne(tablename, item, trx);
  return item;
};

exports.deleteAll = async function(trx) {
  return genericController.deleteAll(tablename, trx);
};

exports.getOne = async function(idjugador) {
  let data = await genericController.getOne(tablename, '*', { idjugador });
  return data;
};

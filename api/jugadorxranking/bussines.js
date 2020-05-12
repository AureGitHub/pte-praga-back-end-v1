const { genericController } = require('../../database/generic.controller');
const tablename = 'jugadorxranking';

exports.updateFinalizaOne = async (id, trx) => {
  const sql = `
  insert into partidoxpistaxranking (idpartido,idpartidoxpista,iddrive,idreves,juegos,gana)
  select * from
  (
  select 
  par.id idpartido,
  pp.id idpartidoxpista,
  drive1.id drive,
  reves1.id reves,
  ppm.juegospareja1 juegos,	 
  (CASE WHEN ppm.juegospareja1 > ppm.juegospareja2 THEN 1  ELSE  0 END) AS Gana
  from partidoxpistaxmarcador ppm
  inner join partido par on ppm.idpartido = par.id
  inner join partidoxpista pp on ppm.idpartidoxpista = pp.id
  inner join partidoxpareja ppa1 on pp.idpartidoxpareja1 = ppa1.id
  inner join partidoxpareja ppa2 on pp.idpartidoxpareja2 = ppa2.id
  inner join jugador drive1 on ppa1.iddrive = drive1.id
  inner join jugador reves1 on ppa1.idreves = reves1.id
  inner join jugador drive2 on ppa2.iddrive = drive2.id
  inner join jugador reves2 on ppa2.idreves = reves2.id
  where ppm.idpartido = 5

  union
  select 
  par.id idpartido,
  pp.id idpartidoxpista,
  drive2.id drive,
  reves2.id reves,
  ppm.juegospareja2 juegos,
      
  (CASE WHEN ppm.juegospareja2 > ppm.juegospareja1 THEN 1  ELSE  0 END) AS Gana
  from partidoxpistaxmarcador ppm
  inner join partido par on ppm.idpartido = par.id
  inner join partidoxpista pp on ppm.idpartidoxpista = pp.id
  inner join partidoxpareja ppa1 on pp.idpartidoxpareja1 = ppa1.id
  inner join partidoxpareja ppa2 on pp.idpartidoxpareja2 = ppa2.id
  inner join jugador drive1 on ppa1.iddrive = drive1.id
  inner join jugador reves1 on ppa1.idreves = reves1.id
  inner join jugador drive2 on ppa2.iddrive = drive2.id
  inner join jugador reves2 on ppa2.idreves = reves2.id
  where ppm.idpartido = ?
  )T
  `;

  await genericController.ExecuteQuery(sql, id, trx);
};

exports.getAllByIdpartido = async idpartido => {
  const sql = `
  select 
ju.alias,
partidog pg,
partidop pp,
juegosg jg,
juegosp  jp
from jugadorxranking jr 
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

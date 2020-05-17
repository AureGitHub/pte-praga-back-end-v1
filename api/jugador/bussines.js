const { genericController } = require('../../database/generic.controller');
const { enumPerfil } = require('../../utils/enum.util');
const tablename = 'jugador';

exports.getAll = async function() {
  const sql = `select 
    j.*,
    pos.descripcion as posicion,  
    per.descripcion as perfil,
    je.descripcion as estado
  from jugador j
  inner join  posicion pos on j.idposicion = pos.id  
  inner join  perfil per on j.idperfil = per.id  
  inner join  jugador_estado je on j.idestado = je.id  
  order by j.alias`;
  return genericController.getAllquery(sql, null);
};

exports.getResumenPartidos = async function(idjugador) {
  const sql = `select
  to_char("dia", 'DD/MM/YYYY HH24:MI') as dia,    
  ppj .nombre,
  coalesce(jd1.alias,'-')  || ' - ' || coalesce(jd2.alias,'-') p1,
  ppm.juegospareja1 jp1,
  coalesce(jd3.alias,'-')  || ' - ' || coalesce(jd4.alias,'-') p2,
  ppm.juegospareja2 jp2,
  ppm.idset as set
  from   partido pa 
  inner join partidoxpistaxjugador ppj on ppj .idpartido = pa.id 
  inner join partidoxpistaxmarcador ppm on ppj .id = ppm.idpartidoxpista 
  left join jugador jd1 on ppj.idjugadordrive1 = jd1.id
  left join jugador jd2 on ppj.idjugadorreves1 = jd2.id
  left join jugador jd3 on ppj.idjugadordrive2 = jd3.id
  left join jugador jd4 on ppj.idjugadorreves2 = jd4.id  
  where 
  ppj.idjugadordrive1 = ? or ppj.idjugadordrive2 = ? or ppj.idjugadorreves1  = ?  or ppj.idjugadorreves2  = ? 
  order by  dia desc, ppj .idturno , ppj .idpista, ppm.idset `;
  return genericController.getAllquery(sql, [
    idjugador,
    idjugador,
    idjugador,
    idjugador,
  ]);
};

exports.getOne = async function(id) {
  let dbUser = await genericController.getOne(tablename, '*', { id });
  dbUser.IsAdmin = dbUser.idperfil === enumPerfil.admin;
  dbUser.IsJugador = dbUser.idperfil === enumPerfil.jugador;
  const { passwordhash, ...userWithoutPass } = dbUser;
  return userWithoutPass;
};

exports.getOneWhere = async function(columns, where) {
  let dbUser = await genericController.getOne(tablename, columns, where);
  return dbUser;
};
exports.updateOne = async function(where, update, trx) {
  return genericController.updateOne(tablename, where, update, trx);
};

exports.createOne = async function createOne(item, trx = null) {
  return genericController.createOne(tablename, item, trx);
};

exports.delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};

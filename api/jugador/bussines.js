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
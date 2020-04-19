const { genericController } = require('../../database/generic.controller');
const tablename = 'partido';

exports.getAll = async function(idjugador) {
  const sql = `select 
  p.id,
  p.idcreador,
  p.idpartido_estado,
  to_char("dia", 'DD/MM/YYYY HH24:MI') as dia,    
  p.duracion,
  p.pistas,
  p.jugadorestotal,
  p.jugadoresapuntados,
  pj.id as idpartidoxjugador
  from partido p
  left join partidoxjugador pj on p.id = pj.idpartido and pj.idjugador = ?
  order by p.dia desc`;
  return genericController.getAllquery(sql, idjugador);
};

exports.getOne = async function(id) {
  const sql = `select 
  p.id,
  p.idcreador,
  p.idpartido_estado,
  to_char("dia", 'DD/MM/YYYY HH24:MI') as dia,    
  p.duracion,
  p.pistas,
  p.jugadorestotal,
  p.jugadoresapuntados   
  from partido p
  where id=?`;
  return genericController.getOnequery(sql, id);
};

exports.getTotalJugadores = async function(id) {
  return genericController.getOne(tablename, 'jugadorestotal', { id });
};

exports.IncrementOne = async function(id, value, trx = null) {
  return genericController.IncrementOne(
    tablename,
    { id },
    'jugadoresapuntados',
    value,
    trx,
  );
};

exports.createOne = async function createOne(NewPartido, trx = null) {
  NewPartido.jugadorestotal = parseInt(NewPartido.pistas) * 4;
  delete NewPartido.id;
  NewPartido.jugadoresapuntados = 0;
  NewPartido['idpartido_estado'] = 1;
  NewPartido = await genericController.createOne(tablename, NewPartido, trx);
  return NewPartido;
};

exports.delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};

exports.updateOne = async function(where, update, trx) {
  return genericController.updateOne(tablename, where, update, trx);
};

const { genericController } = require('../../database/generic.controller');
// const tablename = 'partidoxpistaxranking';

exports.getAll = async function() {
  const sql = `select 
    j.id,
    j.alias,  
    pos.descripcion posicion  
  from jugador j
  inner join  posicion pos on j.idposicion = pos.id  
  order by j.alias`;
  return genericController.getAllquery(sql, null);
};

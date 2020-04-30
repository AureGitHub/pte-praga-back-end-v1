const { genericController } = require('../../database/generic.controller');
const tablename = 'partidoxjugador';
const { enumJugadorxpartidoEstado } = require('../../utils/enum.util');

exports.getAceptadosCount = async function(idpartido) {
  return genericController.GetCount(tablename, 'idpartidoxjugador_estado', {
    idpartido,
    idpartidoxjugador_estado: 1,
  });
};

exports.createOne = async function(item) {
  return genericController.createOne(tablename, item);
};

exports.SetEstado = function(jugadorestotal, jugadoresAceptados) {
  return jugadoresAceptados >= jugadorestotal
    ? enumJugadorxpartidoEstado.Suplente
    : enumJugadorxpartidoEstado.Aceptado;
};

exports.getAllByIdpartido = async function(idpartido) {
  const sql = `select 
  j.id,
  pj.id idpartidoxjugador,
  j.alias,  
  pos.descripcion posicion,
  pj.idpartidoxjugador_estado
  from partidoxjugador pj
  inner join jugador j on pj.idjugador = j.id    
  inner join  posicion pos on j.idposicion = pos.id
  where idpartido=?
  order by pj.created_at`;
  return genericController.getAllquery(sql, [idpartido]);
};

exports.getOne = async function(id) {
  return genericController.getOne(tablename, '*', { id });
};

exports.getAll = async function() {
  return genericController.getAllSinWhere(tablename, '*');
};

exports.getOneByPartidoJugador = async function(idpartido, idjugador) {
  return genericController.getOne(tablename, '*', { idpartido, idjugador });
};

exports.delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};
var updateOne = async function(where, update, trx) {
  return genericController.updateOne(tablename, where, update, trx);
};
exports.updateOne = updateOne;

exports.AsciendePrimerSuplente = async function(idpartido, trx = null) {
  const jugadorAsciende = await genericController.getFirstOne(
    tablename,
    '*',
    { idpartido, idpartidoxjugador_estado: 2 },
    'created_at',
  );

  if (jugadorAsciende) {
    jugadorAsciende['idpartidoxjugador_estado'] = 1;
    await updateOne(
      { idjugador: jugadorAsciende.idjugador, idpartido },
      { idpartidoxjugador_estado: 1 },
      trx,
    );
  }
};

exports.delByIdpartido = async function(idpartido, trx) {
  await genericController.delByWhere(tablename, { idpartido }, trx);
};

var getAceptados = async function(idpartido) {
  return genericController.getAll(tablename, 'id', {
    idpartido,
    idpartidoxjugador_estado: 1,
  });
};

var getSupentes = async function(idpartido) {
  return genericController.getAll(tablename, 'id', {
    idpartido,
    idpartidoxjugador_estado: 1,
  });
};

var SuplentesAceptados = async function(idpartido, cuantos, trx) {
  const suplentes = await getSupentes(idpartido);
  // como mucho, todos los suplentes que hay
  const LosQuePasan = cuantos > suplentes.length ? suplentes.length : cuantos;
  for (let index = 0; index < LosQuePasan; index++) {
    if (suplentes[index]) {
      const { id } = suplentes[index];
      const toUpdate = { idpartidoxjugador_estado: 1 };
      await updateOne({ id }, toUpdate, trx);
    }
  }
};

var AceptadosSuplentes = async function(idpartido, TotalPuedenJugar, trx) {
  const aceptados = await getAceptados(idpartido);
  const cuantosAceptadosDescienden = aceptados.length - TotalPuedenJugar;
  for (let index = 0; index < cuantosAceptadosDescienden; index++) {
    if (aceptados[index]) {
      const { id } = aceptados[index];
      const toUpdate = { idpartidoxjugador_estado: 2 };
      await updateOne({ id }, toUpdate, trx);
    }
  }
};

exports.GestionSuplentes = async (oldPartido, partido, trx) => {
  if (parseInt(oldPartido.pistas) < parseInt(partido.pistas)) {
    // pasar suplentes a Aceptados
    const cuantosSuplentesAscientes =
      (parseInt(partido.pistas) - parseInt(oldPartido.pistas)) * 4;

    await SuplentesAceptados(partido.id, cuantosSuplentesAscientes, trx);
  } else if (parseInt(oldPartido.pistas) > parseInt(partido.pistas)) {
    // pasar Aceptados a suplentes
    // order descendente. LIFO
    await AceptadosSuplentes(partido.id, parseInt(partido.pistas) * 4, trx);
  }
};

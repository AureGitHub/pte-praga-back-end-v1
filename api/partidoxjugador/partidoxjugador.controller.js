const db = require('../../database');
const { genericController } = require('../generic/generic.controller');

const tablename = 'partidoxjugador';

exports.partidoxjugadorController = {
  deleteOne: async function(id, trx = null) {
    if (trx) {
      await trx('partidoxpista')
        .where({ id })
        .del();
    } else {
      await db('partidoxpista')
        .where({ id })
        .del();
    }
  },

  getAll: async function(where, trx = null) {
    var items = await db
      .select('id')
      .from('partidoxjugador')
      .where(where);
    // .orderBy('idpartidoxpista', 'idset');

    return items.rows;

    // const sql = `select
    // pj.id
    // from partidoxjugador pj
    // where idpartido=? and idpartidoxjugador_estado=2
    // order by pj.created_at`;
    // const suplentes = await db.raw(sql, partido.id);
  },

  getAceptados: async function(idpartido) {
    return genericController.getAll(tablename, 'id', {
      idpartido,
      idpartidoxjugador_estado: 1,
    });
  },

  getSupentes: async function(idpartido) {
    return genericController.getAll(tablename, 'id', {
      idpartido,
      idpartidoxjugador_estado: 1,
    });
  },

  SuplentesAceptados: async function(trx, idpartido, cuantos) {
    const suplentes = await this.getSupentes(idpartido);
    // como mucho, todos los suplentes que hay
    const LosQuePasan = cuantos > suplentes.length ? suplentes.length : cuantos;
    for (let index = 0; index < LosQuePasan; index++) {
      if (suplentes[index]) {
        const { id } = suplentes[index];
        const toUpdate = { idpartidoxjugador_estado: 1 };
        await genericController.updateOne(tablename, { id }, toUpdate, trx);
      }
    }
  },

  AceptadosSuplentes: async function(trx, idpartido, TotalPuedenJugar) {
    const aceptados = await this.getAceptados(idpartido);
    const cuantosAceptadosDescienden = aceptados.length - TotalPuedenJugar;
    for (let index = 0; index < cuantosAceptadosDescienden; index++) {
      if (aceptados[index]) {
        const { id } = aceptados[index];
        const toUpdate = { idpartidoxjugador_estado: 2 };
        await genericController.updateOne(tablename, { id }, toUpdate, trx);
      }
    }
  },
};

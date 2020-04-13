const db = require('../../database');
const { genericController } = require('../../database/generic.controller');
const { enumType } = require('../../utils/enum.util');
const tablename = 'partidoxjugador';
const {
  statusCreate,
  statusOKquery,
  statusOKSave,
  assertNoData,
  assertKOParams,
} = require('../../utils/error.util');

exports.getAll = async ctx => {
  const data = await paxjuController.getAll();
  ctx.status = statusOKquery;
  ctx.body = { data };
};

exports.getOne = async ctx => {
  const id = ctx.params.id;
  assertKOParams(ctx, id, 'id', enumType.number);
  const data = await genericController.getOne(tablename, '*', { id });
  ctx.status = statusOKquery;
  ctx.body = { data };
};

var paxjuController = {
  delByIdpartido: async function(idpartido, trx) {
    await genericController.delByWhere(tablename, { idpartido }, trx);
  },
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

  getAll: async function() {
    return genericController.getAllSinWhere(tablename, '*');
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
exports.paxjuController = paxjuController;

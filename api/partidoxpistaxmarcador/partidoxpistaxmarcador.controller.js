const { genericController } = require('../../database/generic.controller');
const { statusOKSave, assertKOParams } = require('../../utils/error.util');
const tablename = 'partidoxpistaxmarcador';
exports.prefix = `/${tablename}`;

const paxpixmaController = {
  delByIdpartido: async function(idpartido, trx) {
    await genericController.delByWhere(tablename, { idpartido }, trx);
  },

  getAllByIdpartido: async function(idpartido) {
    const columns = [
      'id',
      'idpartidoxpista',
      'idset',
      'juegospareja1',
      'juegospareja2',
    ];
    const where = { idpartido };
    const orderBy = ['idpartidoxpista', 'idset'];
    return genericController.getAll(tablename, columns, where, orderBy);
  },
};
exports.paxpixmaController = paxpixmaController;

exports.getAllByIdpartido = async ctx => {
  const { idpartido } = ctx.params;
  assertKOParams(ctx, idpartido, 'idpartido');

  const data = await paxpixmaController.getAllByIdpartido(idpartido);
  ctx.status = statusOKSave;
  ctx.body = { data };
};

exports.createOne = async ctx => {
  const item = ctx.request.body;
  const {
    idpartido,
    idpartidoxpista,
    idset,
    juegospareja1,
    juegospareja2,
  } = ctx.request.body;
  assertKOParams(ctx, idpartido, 'idpartido');
  assertKOParams(ctx, idpartidoxpista, 'idpartidoxpista');
  assertKOParams(ctx, idset, 'idset');
  assertKOParams(ctx, juegospareja1, 'juegospareja1');
  assertKOParams(ctx, juegospareja2, 'juegospareja2');

  const itemRet = await genericController.createOne(tablename, item);
  ctx.status = statusOKSave;
  ctx.body = { data: itemRet };
};

exports.updateOne = async ctx => {
  const item = ctx.request.body;
  const {
    id,
    idpartido,
    idpartidoxpista,
    idset,
    juegospareja1,
    juegospareja2,
  } = ctx.request.body;
  assertKOParams(ctx, id, 'id');
  assertKOParams(ctx, idpartido, 'idpartido');
  assertKOParams(ctx, idpartidoxpista, 'idpartidoxpista');
  assertKOParams(ctx, idset, 'idset');
  assertKOParams(ctx, juegospareja1, 'juegospareja1');
  assertKOParams(ctx, juegospareja2, 'juegospareja2');

  const itemRet = await genericController.createOne(tablename, item);
  ctx.status = statusOKSave;
  ctx.body = { data: itemRet };
};

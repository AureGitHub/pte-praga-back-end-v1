const busOwen = require('./bussines');
const { statusOKSave, assertKOParams } = require('../../utils/error.util');

exports.getAllByIdpartido = async ctx => {
  const { idpartido } = ctx.params;
  assertKOParams(ctx, idpartido, 'idpartido');

  const data = await busOwen.getAllByIdpartido(idpartido);
  ctx.status = statusOKSave;
  ctx.body = { data };
};

exports.createOne = async ctx => {
  const itemRecep = ctx.request.body;
  let { id, ...item } = itemRecep;

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
  assertKOParams(ctx, juegospareja1 >= 0, 'juegospareja1');
  assertKOParams(ctx, juegospareja2 >= 0, 'juegospareja2');

  item = await busOwen.createOne(item);
  ctx.status = statusOKSave;
  ctx.body = { data: item };
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
  assertKOParams(ctx, juegospareja1 >= 0, 'juegospareja1');
  assertKOParams(ctx, juegospareja2 >= 0, 'juegospareja2');

  await busOwen.updateOne({ id }, item);
  ctx.status = statusOKSave;
  ctx.body = { data: item };
};

exports.deleteOne = async function deleteOne(ctx) {
  const { id } = ctx.params;
  assertKOParams(ctx, id, 'id');
  let nDel = await busOwen.delByWhere({ id });
  ctx.status = statusOKSave;
  ctx.body = { data: nDel === 1 };
};

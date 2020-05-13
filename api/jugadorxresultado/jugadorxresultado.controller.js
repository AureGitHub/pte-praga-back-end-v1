// const db = require('../../database');
const { statusOKquery, assertKOParams } = require('../../utils/error.util');
const busOwen = require('./bussines');

exports.getAllByIdpartido = async ctx => {
  const { idpartido } = ctx.params;
  assertKOParams(ctx, idpartido, 'idpartido');
  const data = await busOwen.getAllByIdpartido(idpartido);
  ctx.status = statusOKquery;
  ctx.body = { data };
};

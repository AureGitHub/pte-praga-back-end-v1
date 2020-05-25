// const db = require('../../database');
const { statusOKquery, assertKOParams } = require('../../utils/error.util');
const busOwen = require('./bussines');

exports.getAll = async ctx => {
  const data = await busOwen.getAll();
  ctx.status = statusOKquery;
  ctx.body = { data };
};

exports.getOne = async function getOne(ctx) {
  const { userInToken } = ctx.state;
  const id = parseInt(ctx.params.id);
  ctx.assert(userInToken.id === id, 401, 'Solo puede consultar su ranking');
  assertKOParams(ctx, id, 'id');
  const data = await busOwen.getOne(id);
  ctx.status = statusOKquery;
  ctx.body = { data };
};

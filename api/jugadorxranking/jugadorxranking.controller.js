// const db = require('../../database');
const { statusOKquery } = require('../../utils/error.util');
const busOwen = require('./bussines');

exports.getAll = async ctx => {
  const data = await busOwen.getAll();
  ctx.status = statusOKquery;
  ctx.body = { data };
};

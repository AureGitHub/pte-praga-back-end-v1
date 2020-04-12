let errNoData = new Error('no hay datos para la consulta solicitada');
errNoData.status = 404;
exports.errNoData = errNoData;
const statusNoData = 404;
exports.statusNoData = statusNoData;
exports.statusOKquery = 200;
exports.statusOKSave = 200;

exports.statusCreate = 201;

const statusKOParams = 404;

exports.assertNoData = (ctx, data, message = null) => {
  if (message) {
    ctx.assert(data, statusNoData, `${message} (${ctx.url}, ${ctx.method})`);
  } else {
    ctx.assert(
      data,
      statusNoData,
      `no hay datos para la consulta solicitada (${ctx.url})`,
    );
  }
};

exports.assertKOParams = (ctx, data, paramName) => {
  ctx.assert(
    data,
    statusKOParams,
    `La petición no es correcta. Falta el parámetro (${ctx.url}, 
        ${ctx.method},  ${paramName})`,
  );
};

const { genericController } = require('../../database/generic.controller');
// const uuidv4 = require('uuid/v4');
const db = require('../../database');
const tablename = 'jugador_confirmar';

const delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};

exports.delByWhere = delByWhere;

exports.createOne = async function createOne(idjugador, idtipoconfirmacion) {
  // const uuid = uuidv4();
  const uuid = Math.floor(1000 + Math.random() * 9000);

  await db.transaction(async function(trx) {
    await delByWhere({ idjugador, idtipoconfirmacion }, trx);
    await genericController.createOneSinRet(
      tablename,
      {
        idjugador,
        idtipoconfirmacion,
        uuid,
      },
      trx,
    );
  });
  return uuid;
};

exports.verificarEmail = async function verificarEmail(
  idjugador,
  idtipoconfirmacion,
  uuid,
  trx,
) {
  const data = await genericController.getOne(tablename, '*', {
    idjugador,
    idtipoconfirmacion,
  });
  const confirmacion = data && data.uuid === uuid;

  if (confirmacion) {
    await delByWhere({ idjugador, idtipoconfirmacion }, trx);
  }

  return confirmacion;
};

exports.verificarByuuid = async function verificarByuuid(uuid, trx) {
  const data = await genericController.getOne(tablename, '*', {
    uuid,
  });
  if (data && data.uuid === uuid) {
    await delByWhere({ uuid }, trx);
  }
  return data;
};

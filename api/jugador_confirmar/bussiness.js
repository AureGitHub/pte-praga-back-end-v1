const { genericController } = require('../../database/generic.controller');
const uuidv4 = require('uuid/v4');
const db = require('../../database');
const tablename = 'jugador_confirmar';

const delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};

exports.delByWhere = delByWhere;

exports.createOne = async function createOne(iduser, idtipoconfirmacion) {
  const uuid = uuidv4();

  await db.transaction(async function(trx) {
    await delByWhere({ iduser, idtipoconfirmacion }, trx);
    await genericController.createOneSinRet(
      tablename,
      {
        iduser,
        idtipoconfirmacion,
        uuid,
      },
      trx,
    );
  });
  return uuid;
};

exports.verificarEmail = async function verificarEmail(
  iduser,
  idtipoconfirmacion,
  uuid,
  trx,
) {
  const data = await genericController.getOne(tablename, '*', {
    iduser,
    idtipoconfirmacion,
  });
  const confirmacion = data && data.uuid === uuid;

  if (confirmacion) {
    await delByWhere({ iduser, idtipoconfirmacion }, trx);
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

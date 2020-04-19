const { genericController } = require('../../database/generic.controller');
const tablename = 'partidoxpistaxmarcador';

exports.createOne = async function(item) {
  return genericController.createOne(tablename, item);
};

exports.updateOne = async function(where, update, trx) {
  return genericController.updateOne(tablename, where, update, trx);
};

exports.delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};

exports.getAllByIdpartido = async function(idpartido) {
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
};

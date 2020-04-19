const { genericController } = require('../../database/generic.controller');
const tablename = 'partidoxpareja';

exports.delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};

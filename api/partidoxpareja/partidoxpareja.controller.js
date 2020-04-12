const { genericController } = require('../../database/generic.controller');
const tablename = 'partidoxpareja';

exports.paxpaController = {
  delByIdpartido: async function(idpartido, trx) {
    await genericController.delByWhere(tablename, { idpartido }, trx);
  },
};

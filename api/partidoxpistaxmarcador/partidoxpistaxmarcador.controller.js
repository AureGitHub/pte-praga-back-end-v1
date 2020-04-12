const { genericController } = require('../../database/generic.controller');
const { statusOKSave, assertKOParams } = require('../../utils/error.util');
const tablename = 'partidoxpistaxmarcador';
exports.prefix = `/${tablename}`;

const partidoxpistaxmarcadorController = {
  getAllByIdpartido: async function(idpartido) {
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
  },
};
exports.partidoxpistaxmarcadorController = partidoxpistaxmarcadorController;

exports.getAllByIdpartido = async ctx => {
  const { idpartido } = ctx.params;
  assertKOParams(ctx, idpartido, 'idpartido');

  const data = await partidoxpistaxmarcadorController.getAllByIdpartido(
    idpartido,
  );
  ctx.status = statusOKSave;
  ctx.body = { data };
};

const { genericController } = require('../generic/generic.controller');
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
  ctx.assert(idpartido, 404, 'La petición no es correcta (idpartido)');
  const data = await partidoxpistaxmarcadorController.getAllByIdpartido(
    idpartido,
  );
  ctx.status = 200;
  ctx.body = { data };
};

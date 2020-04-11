const db = require('../../database');

exports.partidoxmarcadorController = {
  deleteOne: async (id, trx = null) => {
    if (trx) {
      await trx('partidoxpistaxmarcador')
        .where({ id })
        .del();
    } else {
      await db('partidoxpistaxmarcador')
        .where({ id })
        .del();
    }
  },

  deleteOneByIdpartido: async (idpartido, trx = null) => {
    if (trx) {
      await trx('partidoxpistaxmarcador')
        .where({ idpartido })
        .del();
    } else {
      await db('partidoxpistaxmarcador')
        .where({ idpartido })
        .del();
    }
  },
};

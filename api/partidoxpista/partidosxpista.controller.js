const db = require('../../database');

exports.partidoxmarcadorController = {
  deleteOne: async (id, trx = null) => {
    if (trx) {
      await trx('partidoxpista')
        .where({ id })
        .del();
    } else {
      await db('partidoxpista')
        .where({ id })
        .del();
    }
  },

  deleteOneByIdpartido: async (idpartido, trx = null) => {
    if (trx) {
      await trx('partidoxpista')
        .where({ idpartido })
        .del();
    } else {
      await db('partidoxpista')
        .where({ idpartido })
        .del();
    }
  },
};

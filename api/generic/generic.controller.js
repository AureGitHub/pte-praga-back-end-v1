const db = require('../../database');

const deletegeneric = async (table, where, trx = null) => {
  if (trx) {
    await trx(table)
      .where(where)
      .del();
  } else {
    await db(table)
      .where(where)
      .del();
  }
};

exports.genericController = {
  updateOne: async function(table, where, item, trx = null) {
    if (trx) {
      await trx(table)
        .where(where)
        .update(item);
    } else {
      await db(table)
        .where(where)
        .update(item);
    }
  },

  deleteById: async function(table, id, trx = null) {
    await deletegeneric(table, { id }, trx);
  },
  delByIdpartido: async function(table, idpartido, trx = null) {
    await deletegeneric(table, { idpartido }, trx);
  },
  getAll: async function(table, colums, where, orderBy = null) {
    var items = null;
    if (orderBy) {
      items = await db
        .select(colums)
        .from(table)
        .where(where)
        .orderBy(orderBy);
    } else {
      items = await db
        .select(colums)
        .from(table)
        .where(where);
    }
    return items;
  },

  getAllquery: async function(sql, parmans) {
    let data = null;
    if (parmans) {
      data = await db.raw(sql, parmans);
    } else {
      data = await db.raw(sql);
    }
    return data.rows;
  },
};

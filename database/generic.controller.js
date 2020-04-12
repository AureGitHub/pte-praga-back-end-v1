const db = require('.');

exports.genericController = {
  deletegeneric: async function(table, where, trx = null) {
    let delRet = null;
    if (trx) {
      delRet = await trx(table)
        .where(where)
        .del();
    } else {
      delRet = await db(table)
        .where(where)
        .del();
    }
    return delRet;
  },

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

  createOne: async function(table, item, trx = null) {
    if (trx) {
      const getBD = await trx(table)
        .insert(item)
        .returning('id');
      item['id'] = getBD[0];
    } else {
      const getBD = await db(table)
        .insert(item)
        .returning('id');
      item['id'] = getBD[0];
    }
  },

  delByWhere: async function(table, where, trx = null) {
    return this.deletegeneric(table, where, trx);
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

  getAllSinWhere: async function(table, colums, orderBy = null) {
    var items = null;
    if (orderBy) {
      items = await db
        .select(colums)
        .from(table)
        .orderBy(orderBy);
    } else {
      items = await db.select(colums).from(table);
    }
    return items;
  },

  getOnequery: async function(sql, parmans) {
    let data = null;
    if (parmans) {
      data = await db.raw(sql, parmans);
    } else {
      data = await db.raw(sql);
    }
    return data.rows[0];
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

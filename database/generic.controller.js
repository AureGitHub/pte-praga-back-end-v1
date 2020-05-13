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

  deleteAll: async function(table, trx = null) {
    const acceso = trx || db;
    await acceso(table).del();
  },

  updateOne: async function(table, where, update, trx = null) {
    const acceso = trx || db;
    await acceso(table)
      .where(where)
      .update(update);
  },

  createOne: async function(table, item, trx = null) {
    const acceso = trx || db;
    const getBD = await acceso(table)
      .insert(item)
      .returning('id');
    item['id'] = getBD[0];
    return item;
  },

  createOneSinRet: async function(table, item, trx = null) {
    const acceso = trx || db;
    await acceso(table).insert(item);
  },

  IncrementOne: async function(table, where, column, value, trx = null) {
    if (trx) {
      await trx(table)
        .where(where)
        .increment(column, value);
    } else {
      await db(table)
        .where(where)
        .increment(column, value);
    }
  },

  delByWhere: async function(table, where, trx = null) {
    return this.deletegeneric(table, where, trx);
  },

  GetCount: async function(table, colums, where) {
    var items = await db
      .count(colums)
      .from(table)
      .where(where);
    return parseInt(items[0].count);
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

  getFirstOne: async function(table, colums, where, orderBy, trx = null) {
    const acceso = trx || db;
    return acceso
      .first(colums)
      .from(table)
      .where(where)
      .orderBy(orderBy);
  },

  getOnequery: async function(sql, parmans) {
    let data = null;
    if (parmans) {
      data = await db.raw(sql, parmans);
    } else {
      data = await db.raw(sql);
    }
    return data.rows[0] ? data.rows[0] : 0;
  },

  getOne: async function(table, colums, where) {
    let data = await this.getAll(table, colums, where);
    return data[0] ? data[0] : null;
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
  ExecuteQuery: async function(sql, parmans, trx = null) {
    const acceso = trx || db;
    if (parmans) {
      await acceso.raw(sql, parmans);
    } else {
      await acceso.raw(sql);
    }
  },
};

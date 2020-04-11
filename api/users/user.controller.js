'use strict';

const generateId = require('../../utils/generateId.util');
const db1 = require('../../database');
/**
 * Mock database, replace this with your db models import, required to perform query to your database.
 */
const db = {
  users: [
    {
      id: 'bff28903-042e-47c2-b9ee-07c3954989ec',
      name: 'Marco',
      created_at: 1558536830937,
    },
    {
      id: 'dca01a32-36e6-4886-af75-8e7caa0162a9',
      name: 'Leonardo',
      created_at: 1558536843742,
    },
    {
      id: 'dca01a32-36e6-4886-af75-8e7caa0162a9',
      name: 'Berta',
      created_at: 1558536863550,
    },
  ],
};

exports.getOne = ctx => {
  const { userId } = ctx.params;
  const user = db.users.find(user => user.id === userId);
  ctx.assert(user, 404, "The requested user doesn't exist");
  ctx.status = 200;
  ctx.body = user;
};

exports.getAll = async ctx => {
  const users = await db1.select('*').from('jugador');

  let { userInToken } = ctx.state;
  ctx.status = 200;
  ctx.body = { data: users };
};

exports.getAllP = async ctx => {
  const users = await db1.select('*').from('pistas');

  ctx.status = 200;
  ctx.body = { data: JSON.stringify(users) };
};

exports.createOne = async ctx => {
  const { name } = ctx.request.body;
  ctx.assert(name, 400, 'The user info is malformed!');
  const id = generateId();
  const newUser = {
    id,
    name,
    timestamp: Date.now(),
  };
  db.users.push(newUser);
  const createdUser = db.users.find(user => user.id === id);
  ctx.status = 201;
  ctx.body = createdUser;
};

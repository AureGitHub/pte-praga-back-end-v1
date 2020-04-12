const { genericController } = require('../../database/generic.controller');

const { statusOKSave } = require('../../utils/error.util');

const selecciones = { label: 'seleccione...' };

const getCodigo = async tabla => {
  const data = await genericController.getAllSinWhere(
    tabla,
    ['id as value', 'descripcion as label'],
    'id',
  );
  data.unshift(selecciones);
  return data;
};

// old getpartidoxpistaByIdpartido
exports.getAllPosicion = async ctx => {
  const data = await getCodigo('posicion');
  ctx.status = statusOKSave;
  ctx.body = { data };
};

exports.getAllPerfil = async ctx => {
  const data = await getCodigo('perfil');
  ctx.status = statusOKSave;
  ctx.body = { data };
};

exports.getAllJugadorEstado = async ctx => {
  const data = await getCodigo('jugador_estado');
  ctx.status = statusOKSave;
  ctx.body = { data };
};

exports.getAllPartidoEstado = async ctx => {
  const data = await getCodigo('partido_estado');
  ctx.status = statusOKSave;
  ctx.body = { data };
};

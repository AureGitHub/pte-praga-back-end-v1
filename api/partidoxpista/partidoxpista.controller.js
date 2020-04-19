// const db = require('../../database');
const busOwen = require('./bussines');
const buspaxpixma = require('../partidoxpistaxmarcador/bussines');
const { statusOKSave, assertKOParams } = require('../../utils/error.util');

exports.getAllByIdpartido = async ctx => {
  const { idpartido } = ctx.params;
  assertKOParams(ctx, idpartido, 'idpartido');
  const data = await busOwen.getAllByIdpartido(idpartido);
  // todos los marcadores de todos los partidos del partido
  const marcadores = await buspaxpixma.getAllByIdpartido(idpartido);

  data.forEach(element => {
    let susMarcadores = marcadores.filter(
      a => a.idpartidoxpista === element.id,
    );

    susMarcadores.forEach(marcador => {
      element[`set${marcador.idset}`] = marcador;
    });

    // element['marcador'] = marcadores.filter(a=> a.idpartidoxpista === element.id);
  });

  ctx.status = statusOKSave;
  ctx.body = { data };
};

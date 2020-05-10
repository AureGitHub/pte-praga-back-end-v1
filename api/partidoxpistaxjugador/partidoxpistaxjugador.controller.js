// const db = require('../../database');
const db = require('../../database');
const busOwen = require('./bussines');
const buspaxpixma = require('../partidoxpistaxmarcador/bussines');
const { statusOKSave, assertKOParams } = require('../../utils/error.util');
const buspaxju = require('../partidoxjugador/bussines');
const buspar = require('../partido/bussines');
const {
  enumJugadorxpartidoEstado,
  enumPosicion,
} = require('../../utils/enum.util');

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

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function HacerParejas(lstdrivers, lstreves, pistas) {
  let numPar = 0;
  let parejas = [];
  let idjugadorNeg = -1; // para simular jugadores cuando hay huecos
  while (lstdrivers.length > 0 || lstreves.length > 0) {
    let drive = null;
    let reves = null;
    // busco el drive
    if (lstdrivers.length > 0) {
      const indexDrive = getRndInteger(0, lstdrivers.length - 1);
      drive = lstdrivers[indexDrive];
      lstdrivers.splice(indexDrive, 1);
    } else if (lstreves.length > 0) {
      const indexReves = getRndInteger(0, lstreves.length - 1);
      drive = lstreves[indexReves];
      lstreves.splice(indexReves, 1);
    }

    // busco el reves

    if (lstreves.length > 0) {
      const indexReves = getRndInteger(0, lstreves.length - 1);
      reves = lstreves[indexReves];
      lstreves.splice(indexReves, 1);
    } else if (lstdrivers.length > 0) {
      const indexDrive = getRndInteger(0, lstdrivers.length - 1);
      reves = lstdrivers[indexDrive];
      lstdrivers.splice(indexDrive, 1);
    }

    numPar++;
    parejas.push({
      numPar,
      drive: drive ? drive.id : idjugadorNeg--,
      reves: reves ? reves.id : idjugadorNeg--,
    });
  }

  // tengo que completar las parejas necesarias..

  for (var index = parejas.length; index < pistas * 2; index++) {
    parejas.push({
      numPar: index + 1,
      drive: idjugadorNeg--,
      reves: idjugadorNeg--,
    });
  }

  let pairs = [];

  for (var i = 0; i < parejas.length; i++) {
    for (var j = 0; j < parejas.length; j++) {
      if (parejas[i] !== parejas[j]) {
        let x = null;
        let y = null;
        if (parejas[i] < parejas[j]) {
          x = parejas[i];
          y = parejas[j];
        } else {
          x = parejas[j];
          y = parejas[i];
        }

        if (!pairs.find(a => a.x === x && a.y === y)) {
          pairs.push({ x, y });
        }
      }
    }
  }

  return pairs;
}

function HacerDistribucion(ctx, turnos, pistas, parejas) {
  let distribucionTurnoPista = [];
  for (var idturno = 1; idturno <= turnos; idturno++) {
    // 3 partidos por pista
    let parajeInTurno = [];
    for (var idpista = 1; idpista <= pistas; idpista++) {
      let idpartidoxpareja1 = null;
      let idpartidoxpareja2 = null;
      if (parejas.length > 0) {
        let parejasDiponibles = parejas.filter(
          a =>
            !parajeInTurno.find(b => b === a.x) &&
            !parajeInTurno.find(b => b === a.y),
        );
        if (parejasDiponibles && parejasDiponibles.length > 0) {
          // elijo al azar una de las diponibles
          let pairToAdd =
            parejasDiponibles[getRndInteger(0, parejasDiponibles.length - 1)];
          parajeInTurno.push(pairToAdd.x);
          parajeInTurno.push(pairToAdd.y);
          // la borro de las parejas totales
          parejas = parejas.filter(a => a !== pairToAdd);

          idpartidoxpareja1 = pairToAdd.x;
          idpartidoxpareja2 = pairToAdd.y;
        }
      }

      distribucionTurnoPista.push({
        idturno,
        idpista,
        p1: idpartidoxpareja1,
        p2: idpartidoxpareja2,
      });
    }
  }
  return distribucionTurnoPista;
}

exports.CreateParejasAleatorio = async ctx => {
  const { idpartido } = ctx.params;
  assertKOParams(ctx, idpartido, 'idpartido');

  let jugadores = await buspaxju.getAllByIdpartido(idpartido);
  const partido = await buspar.getOne(idpartido);
  const { pistas, turnos } = partido;

  let lstdrivers = jugadores.filter(
    a =>
      a.idpartidoxjugador_estado === enumJugadorxpartidoEstado.Aceptado &&
      a.idposicion === enumPosicion.drive,
  );

  let lstreves = jugadores.filter(
    a =>
      a.idpartidoxjugador_estado === enumJugadorxpartidoEstado.Aceptado &&
      a.idposicion === enumPosicion.reves,
  );

  const parejas = HacerParejas(lstdrivers, lstreves, pistas);
  const distribucionTurnoPista = HacerDistribucion(
    ctx,
    turnos,
    pistas,
    parejas,
  );

  // modifico las pistas con las parejas
  await db.transaction(async function(trx) {
    for (var index = 0; index < distribucionTurnoPista.length; index++) {
      const { idturno, idpista, p1, p2 } = distribucionTurnoPista[index];
      const where = { idpartido, idpista, idturno };
      const update = {
        idjugadordrive1: p1.drive < 0 ? null : p1.drive,
        idjugadorreves1: p1.reves < 0 ? null : p1.reves,
        idjugadordrive2: p2.drive < 0 ? null : p2.drive,
        idjugadorreves2: p2.reves < 0 ? null : p2.reves,
      };
      await busOwen.updateOne(where, update, trx);
    }
  });

  ctx.status = statusOKSave;
  ctx.body = { data: true };
};

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

function ParejasAleatorio(lstdrivers, lstreves) {
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
  return parejas;
}

function compare(a, b) {
  if (a.posicionranking > b.posicionranking) return 1;
  if (b.posicionranking > a.posicionranking) return -1;

  return 0;
}

function ParejasByRanking(lstdrivers, lstreves, pistas) {
  // si no están en el ranking los mando a la última posicion
  lstdrivers.forEach(item => {
    if (!item.posicionranking) {
      item.posicionranking = 100;
    }
  });

  lstreves.forEach(item => {
    if (!item.posicionranking) {
      item.posicionranking = 100;
    }
  });

  const TotalJugadoresNecesarios = pistas * 4;
  const TotalPorPos = pistas * 2;
  const TotalJugadoresDisponibles = lstdrivers.length + lstreves.length;

  let idjugadorNeg = -1; // para simular jugadores cuando hay huecos

  if (TotalJugadoresDisponibles < TotalJugadoresNecesarios) {
    // añado tantos jugadores FICTICIO como necesite
    for (
      var index = TotalJugadoresDisponibles;
      index < TotalJugadoresNecesarios;
      index++
    ) {
      if (index % 2) {
        if (lstdrivers.length < TotalPorPos) {
          lstdrivers.push({ id: idjugadorNeg--, posicionranking: 100 });
        } else if (lstreves.length < TotalPorPos) {
          lstreves.push({ id: idjugadorNeg--, posicionranking: 100 });
        }
      } else {
        if (lstreves.length < TotalPorPos) {
          lstreves.push({ id: idjugadorNeg--, posicionranking: 100 });
        } else if (lstdrivers.length < TotalPorPos) {
          lstdrivers.push({ id: idjugadorNeg--, posicionranking: 100 });
        }
      }
    }
  }

  lstdrivers.sort(compare);
  lstreves.sort(compare);
  // al llegar aqui ya tengo que tener tantos jugadores como necesite

  if (lstdrivers.length > TotalPorPos) {
    // tengo mas drives de los necesarios... paso los de menos coef al reves
    const totalDrives = lstdrivers.length;
    for (let index = TotalPorPos; index < totalDrives; index++) {
      const indexDrive = lstdrivers.length - 1; // el peor
      lstreves.push(lstdrivers[indexDrive]);
      lstdrivers.splice(indexDrive, 1);
    }
  } else if (lstreves.length > TotalPorPos) {
    // tengo mas reves de los necesarios... paso los de menos coef al drive
    const totalReves = lstreves.length;
    for (let index = TotalPorPos; index < totalReves; index++) {
      const indexReves = lstreves.length - 1; // el peor
      lstdrivers.push(lstreves[indexReves]);
      lstreves.splice(indexReves, 1);
    }
  }

  // al llegar aqui, tengo los mismo reves que drives
  // Uno los últimos de una lista con los primeros de la otra
  let numPar = 0;
  let parejas = [];
  for (let index = 0; index < lstdrivers.length; index++) {
    numPar++;
    parejas.push({
      numPar,
      drive: lstdrivers[index].id,
      reves: lstreves[lstreves.length - 1 - index].id,
    });
  }

  return parejas;

  // let numPar = 0;
  // let parejas = [];

  // while (lstdrivers.length > 0 || lstreves.length > 0) {
  //   let drive = null;
  //   let reves = null;
  //   // busco el drive
  //   if (lstdrivers.length > 0) {
  //     const indexDrive = 0; // el de mayor ranking
  //     drive = lstdrivers[indexDrive];
  //     lstdrivers.splice(indexDrive, 1);
  //   } else if (lstreves.length > 0) {
  //     const indexReves = 0; // el de mayor ranking
  //     drive = lstreves[indexReves];
  //     lstreves.splice(indexReves, 1);
  //   }

  //   // busco el reves

  //   if (lstreves.length > 0) {
  //     const indexReves = lstreves.length - 1;
  //     reves = lstreves[indexReves];
  //     lstreves.splice(indexReves, 1);
  //   } else if (lstdrivers.length > 0) {
  //     const indexDrive = lstdrivers.length - 1;
  //     reves = lstdrivers[indexDrive];
  //     lstdrivers.splice(indexDrive, 1);
  //   }

  //   numPar++;
  //   parejas.push({
  //     numPar,
  //     drive: drive ? drive.id : idjugadorNeg--,
  //     reves: reves ? reves.id : idjugadorNeg--,
  //   });
  // }
  // return parejas;
}

function HacerParejas(lstdrivers, lstreves, pistas, tipo) {
  let parejas = [];
  if (tipo === 1) {
    parejas = ParejasAleatorio(lstdrivers, lstreves);
  } else if (tipo === 2) {
    parejas = ParejasByRanking(lstdrivers, lstreves, pistas);
  }

  // tengo que completar las parejas necesarias..
  let idjugadorNeg = -1;
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
      if (parejas[i].numPar !== parejas[j].numPar) {
        let x = null;
        let y = null;
        if (parejas[i].numPar < parejas[j].numPar) {
          x = parejas[i];
          y = parejas[j];
        } else {
          x = parejas[j];
          y = parejas[i];
        }

        if (
          !pairs.find(a => a.x.numPar === x.numPar && a.y.numPar === y.numPar)
        ) {
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

// victor's button
exports.CreateParejasPorRanking = async ctx => {
  await CreateParejas(ctx, 2);
};

exports.CreateParejasAleatorio = async ctx => {
  await CreateParejas(ctx, 1);
};

/// tipo = 1 Aleatoria ; 2 Por ranking
var CreateParejas = async (ctx, tipo) => {
  const { idpartido } = ctx.params;
  assertKOParams(ctx, idpartido, 'idpartido');

  let jugadores = await buspaxju.getAllByIdpartido(idpartido);
  assertKOParams(ctx, jugadores.length, 'No hay jugadores');
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

  const parejas = HacerParejas(lstdrivers, lstreves, pistas, tipo);
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

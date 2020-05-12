const { genericController } = require('../../database/generic.controller');
const tablename = 'partidoxpistaxjugador';
const { enumPosicion } = require('../../utils/enum.util');

exports.updateOne = async function(where, update, trx) {
  return genericController.updateOne(tablename, where, update, trx);
};

var delByWhere = async function(where, trx) {
  return genericController.delByWhere(tablename, where, trx);
};
exports.delByWhere = delByWhere;
// para pubicar
exports.getAllByIdpartido = async idpartido => {
  const sql = `select 
  pxpi.id,
  pxpi.nombre,
  coalesce(jd1.alias,'-') jd1,
  coalesce(jd2.alias,'-') jr1,
  coalesce(jd3.alias,'-') jd2,
  coalesce(jd4.alias,'-') jr2, 
  pxpi.idpista,
  pxpi.idturno
  from partidoxpistaxjugador pxpi  
  left join jugador jd1 on pxpi.idjugadordrive1 = jd1.id
  left join jugador jd2 on pxpi.idjugadorreves1 = jd2.id
  left join jugador jd3 on pxpi.idjugadordrive2 = jd3.id
  left join jugador jd4 on pxpi.idjugadorreves2 = jd4.id  
  where pxpi.idpartido=?
  order by idturno,idpista`;
  return genericController.getAllquery(sql, idpartido);
};

var createOne = async function(item, trx = null) {
  var data = await genericController.createOne(tablename, item, trx);
  return data;
};

exports.CreatePistas = async function(idpartido, pistas, turnos, trx) {
  await delByWhere({ idpartido }, trx);
  for (var idturno = 1; idturno <= turnos; idturno++) {
    for (var idpista = 1; idpista <= pistas; idpista++) {
      const nombre = `Partido_T${idturno}_P${idpista}`;
      await createOne({ idpartido, idturno, idpista, nombre }, trx);
    }
  }
};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function VecesjugoComo(lstparxmar, pos, idjugador) {
  let lista = [];
  if (pos === enumPosicion.drive) {
    lista = lstparxmar.filter(
      a => a.idjugadordrive1 === idjugador || a.idjugadordrive2 === idjugador,
    );
  } else if (pos === enumPosicion.reves) {
    lista = lstparxmar.filter(
      a => a.idjugadorreves1 === idjugador || a.idjugadorreves2 === idjugador,
    );
  }
  return lista.length;
}
function ResultadosByJugador(lstparxmar, idjugador) {
  let juegosg = 0;
  let juegosp = 0;
  let partidog = 0;
  let partidop = 0;
  let juegosgd = 0;
  let juegosgr = 0;
  let juegospd = 0;
  let juegospr = 0;
  let partidogd = 0;
  let partidogr = 0;
  let partidopd = 0;
  let partidopr = 0;

  lstparxmar.forEach(item => {
    if (item.idjugadordrive1 === idjugador) {
      juegosgd += item.juegospareja1;
      juegospd += item.juegospareja2;
      partidogd += item.gana1;
      partidopd += item.gana2;

      juegosg += item.juegospareja1;
      juegosp += item.juegospareja2;
      partidog += item.gana1;
      partidop += item.gana2;
    }
    if (item.idjugadordrive2 === idjugador) {
      juegosgd += item.juegospareja2;
      juegospd += item.juegospareja1;
      partidogd += item.gana2;
      partidopd += item.gana1;

      juegosg += item.juegospareja2;
      juegosp += item.juegospareja1;
      partidog += item.gana2;
      partidop += item.gana1;
    }
    if (item.idjugadorreves1 === idjugador) {
      juegosgr += item.juegospareja1;
      juegospr += item.juegospareja2;
      partidogr += item.gana1;
      partidopr += item.gana2;

      juegosg += item.juegospareja1;
      juegosp += item.juegospareja2;
      partidog += item.gana1;
      partidop += item.gana2;
    }
    if (item.idjugadorreves2 === idjugador) {
      juegosgr += item.juegospareja2;
      juegospr += item.juegospareja1;
      partidogr += item.gana2;
      partidopr += item.gana1;

      juegosg += item.juegospareja2;
      juegosp += item.juegospareja1;
      partidog += item.gana2;
      partidop += item.gana1;
    }
  });

  return {
    juegosg,
    juegosp,
    partidog,
    partidop,
    juegosgd,
    juegosgr,
    juegospd,
    juegospr,
    partidogd,
    partidogr,
    partidopd,
    partidopr,
  };
}

exports.GetInfomeByPartido = async (idpartido, turnos) => {
  const sql = `select 
  pp.idjugadordrive1,
  pp.idjugadorreves1, 
  pp.idjugadordrive2,
  pp.idjugadorreves2,
  --pp.nombre ,
  --pm.idset ,
  case when pm.juegospareja1 is null then 0 else pm.juegospareja1 end juegospareja1,
  case when pm.juegospareja2 is null then 0 else pm.juegospareja2 end juegospareja2,
  
  case when pm.juegospareja1 >  pm.juegospareja2 then 1 else 0 end gana1,
  case when pm.juegospareja2 >  pm.juegospareja1 then 1 else 0 end gana2
  from partidoxpistaxjugador pp
  left join partidoxpistaxmarcador pm on pp.id = pm.idpartidoxpista 
  where 
  pp.idpartido = ?
  order by pp.idturno , pp.idpista , pm.idset `;
  const lstparxmar = await genericController.getAllquery(sql, idpartido);

  let jugxpar = [];
  jugxpar = lstparxmar.map(a => a.idjugadordrive1);
  jugxpar = jugxpar.concat(lstparxmar.map(a => a.idjugadordrive2));
  jugxpar = jugxpar.concat(lstparxmar.map(a => a.idjugadorreves1));
  jugxpar = jugxpar.concat(lstparxmar.map(a => a.idjugadorreves2));
  jugxpar = jugxpar.filter(onlyUnique);

  let lstSalida = [];

  jugxpar.forEach(idjugador => {
    const partidos = turnos;

    const drive = VecesjugoComo(lstparxmar, enumPosicion.drive, idjugador);
    const reves = VecesjugoComo(lstparxmar, enumPosicion.reves, idjugador);
    const resultadosGugador = ResultadosByJugador(lstparxmar, idjugador);
    let itemSal = { idjugador, idpartido, partidos, drive, reves };
    lstSalida.push({ ...itemSal, ...resultadosGugador });
  });

  return lstSalida;
};

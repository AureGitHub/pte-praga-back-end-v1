const busjuco = require('../jugador_confirmar/bussiness');
const { enumTipoJugadorConfirmacion } = require('../../utils/enum.util');
const SendEmail = require('../../utils/email');

exports.enviarConfirmacionEmail = async function enviarConfirmacionEmail(
  iduser,
  email,
) {
  const uuid = await busjuco.createOne(
    iduser,
    enumTipoJugadorConfirmacion.Email,
  );
  SendEmail(
    email,
    'Solicitud de confirmación de correo sunday praga ✔',
    'text/plain',
    'Hola, este es tu código de confirmación: ' + uuid,
  );
};

exports.enviarConfirmacioPassword = async function enviarConfirmacionEmail(
  iduser,
  email,
) {
  const uuid = await busjuco.createOne(
    iduser,
    enumTipoJugadorConfirmacion.Password,
  );
  SendEmail(
    email,
    'Solicitud de código para cambiar la password de sunday praga ✔',
    'text/plain',
    'Hola, este es tu código de confirmación: ' + uuid,
  );
};

exports.enviarConfirmacionPass = async function enviarConfirmacionPass(
  iduser,
  email,
) {
  const uuid = busjuco.createOne(iduser, enumTipoJugadorConfirmacion.Password);
  SendEmail(
    email,
    'Solicitud de confirmación de correo sunday praga ✔',
    'text/plain',
    'Hola, este es tu código de confirmación: ' + uuid,
  );
};

module.exports = {
  generic: require('./../database/generic.controller').genericController,
  paxju: require('./partidoxjugador/partidoxjugador.controller')
    .paxjuController,
  paxpixma: require('./partidoxpistaxmarcador/partidoxpistaxmarcador.controller')
    .paxpixmaController,
  paxpi: require('./partidoxpista/partidoxpista.controller').paxpiController,
  paxpa: require('./partidoxpareja/partidoxpareja.controller').paxpaController,
  paxpixra: require('./partidoxpistaxranking/partidoxpistaxranking.controller')
    .paxpixraController,
};

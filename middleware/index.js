module.exports = {
  errorHandler: require('./error.middleware'),
  errorjwtHandler: require('./error.jwt.middleware'),
  secureHandler: require('./secure.middleware'),
};

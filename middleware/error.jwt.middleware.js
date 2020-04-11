module.exports = async (ctx, next) => {
  return next().catch(err => {
    if (err.status === 401) {
      ctx.status = 401;
      let errMessage = err.originalError
        ? err.originalError.message
        : err.message;

      // let errName = err.originalError ? err.originalError.name : '';

      // if (errName === 'TokenExpiredError' || errName === 'JsonWebTokenError') {
      //   ctx.status = 498;
      // }
      ctx.body = {
        error: errMessage,
      };
      ctx.set('X-Status-Reason', errMessage);
    } else {
      throw err;
    }
  });
};

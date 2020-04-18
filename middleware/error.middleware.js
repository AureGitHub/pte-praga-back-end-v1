module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status >= 500) console.log('Error handler:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      message: `${err.message}. (${ctx.url}, ${ctx.method})`,
    };
  }
};

module.exports = function*() {
  this.body = `Url no valida (${this.method} a ${this.url}) `;
  this.status = 404;
  // or redirect etc
  // this.redirect('/someotherspot');
};

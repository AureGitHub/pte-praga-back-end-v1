var { SENDGRID_API_KEY } = require('../config');

const SendEmail = function(emailTo, subject, typeContent, contenido) {
  var helper = require('sendgrid').mail;
  var fromEmail = new helper.Email('sunday.praga.sunday@aurenet.com');
  var toEmail = new helper.Email(emailTo);
  var content = new helper.Content(typeContent, contenido);
  var mail = new helper.Mail(fromEmail, subject, toEmail, content);

  var sg = require('sendgrid')(SENDGRID_API_KEY);
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, function() {
    // console.log(response.statusCode);
    // console.log(response.body);
    // console.log(response.headers);
  });
};

module.exports = SendEmail;

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
  auth: {
    api_user: 'mariogs',
    api_key: 'patata123'
  }
}

var client = nodemailer.createTransport(sgTransport(options));

var email = {
  from: 'jose.gallud@uclm.es',
  to: 'mario_bolero@hotmail.com',
  subject: 'Hello',
  text: 'Hello world',
  html: '<b>Hello world</b>'
};

client.sendMail(email, function(err, info){
    if (err ){
      console.log(error);
    }
    else {
      console.log('Message sent: ' + info.response);
    }
});
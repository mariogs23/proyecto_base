//var url="http://127.0.0.1:1338/";
var url="https://pasaniveles.herokuapp.com/";

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');


var options = {
  auth: {
    api_user: 'mariogs',
    api_key: 'patata123'
  }
}

var client = nodemailer.createTransport(sgTransport(options));

module.exports.enviarEmail=function (direccion, cadena){
	
	var email = {
		  from: 'pasaniveles@gmail.com',
		  to: direccion,
		  subject: 'Cofirmar cuenta',
		  text: 'Cofirmar cuenta',
		  html: cadena
	};

	 client.sendMail(email, function(err, info){
	    if (err ){
	      console.log(error);
	    }
	    else {
	      console.log('Message sent: ' + info.response);
	    }
	});

}

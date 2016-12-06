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


//Se le pasa un texto dependiendo de si es un email u otro

module.exports.enviarEmail=function (direccion, key){
	var email = {
		  from: 'pasaniveles@uclm.es',
		  to: direccion,
		  subject: 'Cofirmar cuenta',
		  text: 'Cofirmar cuenta',
		  html: '<a href= "'+url+'confirmarUsuario/'+direccion+'/'+key+'">Pasa Niveles</a>'
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


module.exports.enviarClave=function (direccion, password){
	var email = {
		  from: 'pasaniveles@uclm.es',
		  to: direccion,
		  subject: 'Recordatorio de contraseña',
		  text: 'Recordatorio de contraseña',
		  html: '<a>Tu contraseña es: '+password+'</a>'
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
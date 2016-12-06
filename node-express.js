
var fs=require("fs");
//var config=JSON.parse(fs.readFileSync("config.json"));
//var host=config.host;
//var port=config.port;
//var url="http://127.0.0.1:1338/";
//var url="https://pasaniveles.herokuapp.com/";

var exp=require("express");
var bodyParser=require("body-parser"); 
var mongo=require("mongodb").MongoClient; 
var app=exp(); 
var modelo=require('./servidor/modelo.js');
var ObjectID=require("mongodb").ObjectID;

//var nodemailer = require('nodemailer');
//var sgTransport = require('nodemailer-sendgrid-transport');
//var client = nodemailer.createTransport(sgTransport(options));

var cf=require("./servidor/cifrado.js");

//var juego= new modelo.Juego();
//var usuariosCol;
var persistencia=require("./servidor/persistencia.js");

var moduloEmail=require("./servidor/email.js");
var fm=new modelo.JuegoFM("./servidor/coordenadas.json");
var juego= fm.makeJuego(fm.juego, fm.array);

//console.log(juego.niveles);

var usuariosCol;
var resultadosCol;
var limboCol;
/*
var options = {
  auth: {
    api_user: 'mariogs',
    api_key: 'patata123'
  }
}*/




app.set('port', (process.env.PORT || 1338));

//app.use(app.router);
app.use(exp.static(__dirname +"/cliente"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());




app.get("/",function(request,response){
	var contenido=fs.readFileSync("./cliente/index-nav.html");
	response.setHeader("Content-type","text/html");
	response.send(contenido);
	//insertar({email:"la",password:"la", nivel:"0"});
});

app.get('/crearUsuario/:nombre',function(request,response){
	//crear el usuario con el nombre
	var usuario= new modelo.Usuario(request.params.nombre);
	juego.agregarUsuario(usuario);
	var id=usuario.id;
	usuario=juego.obtenerUsuario(id);
	//console.log(usuario);
	response.send({'nombre':usuario.nombre,'nivel':usuario.nivel,'id':usuario.id});
});

app.get('/comprobarUsuario/:id',function(request,response){
	var id=request.params.id;
	var usuario=juego.obtenerUsuario(id);
	var json={'nivel':-1};
	//console.log("comprobar usuario: "+usuario);
	if (usuario!=undefined){		
		json={'nivel':usuario.nivel};
	}
	response.send(json);
});

app.get('/nivelCompletado/:id/:tiempo',function(request,response){
	var uid=request.params.id;
	var tiempo=request.params.tiempo;
	var usuario=juego.obtenerUsuario(uid);

	//console.log(tiempo);
	
	if(usuario!=undefined){
		agregarResultado(new modelo.Resultado(usuario.nombre,usuario.email, usuario.nivel,tiempo, (new Date().valueOf())));
		usuario.nivel=usuario.nivel+1;
		//console.log(juego.resultados);
		
		usuariosCol.update({_id:ObjectID(uid)},usuario,function(err,result){
		 	//console.log(result);
		   if (result.result.nModified==0){
		     console.log("No se pudo actualizar");
		     response.send({'nivel':-1});
		   }
		   else{ 
		     usuariosCol.find({_id:ObjectID(uid)}).toArray(function(error,usr){
		      if (!error){
		         if (usr.length!=0){
		           json=usr[0];
		         } 
		      }
		     console.log("Usuario modificado");
		     //console.log(json);
		     response.send({'nivel':usr[0].nivel});
		    });
		  }
		});
	}else{
		response.send({'nivel':-1});
	}
});

app.get('/obtenerResultados/:id',function(request,response){
	var id=request.params.uid;
	var usuario=juego.obtenerUsuario(id);
	var json={'resultados':[]};
	/*if (usuario){
		json=juego.resultados;
		
	}*/
	resultadosCol.find().toArray(function(error,result){
		      if (!error){
		         if (result.length!=0){
		           json=result;
		         } 
		      }
		     console.log("Usuario modificado");
		     //console.log(json);
		     response.send(json);
	});

});

app.get('/obtenerUid/:email/:key',function(request,response){
	var email=request.params.email;
	var key=request.params.key;
	
	var json={uid:-1};

	limboCol.find({email:email,key:key}).toArray(function(error,usr){
	         if (usr.length!=0){
	           json={uid:usr[0]._id};
	         } 
		     response.send(json);
	});

});

app.get("/pedirNivel/:uid",function(request,response){
 var uid=request.params.uid;
 var usuario=juego.obtenerUsuario(uid);
 var json={'nivel':-1};

  if (usuario && usuario.nivel<juego.niveles.length){
  	//console.log(usuario);
    response.send(juego.niveles[usuario.nivel]);
  }
  else{
  	//console.log(json);;
   	response.send(json);
  }
  
});

app.get('/volverAJugar/:uid',function(request,response){
	var uid=request.params.uid;
	//console.log(uid);
 	var usuario=juego.obtenerUsuario(uid);
 	//console.log(usuario);
	usuario.nivel=0;
	var json={'email':undefined};

	usuariosCol.update({_id:ObjectID(uid)},usuario,function(err,result){
	   //console.log(result);
	   if (result.result.nModified==0){
		    console.log("No se pudo actualizar");
		    response.send(json);
	   }
	   else{ 
		     usuariosCol.find({_id:ObjectID(uid)}).toArray(function(error,usr){
		      if (!error){
		         if (usr.length!=0){
		           json=usr[0];
		         } 
		      }
		     console.log("Usuario modificado");
		     //console.log(json);
		     response.send(json);
	    });
	  }
	});
});


app.post("/login",function(request,response){
	 var email=request.body.email;
	 var pass=request.body.password;
	 var passCifrada= cf.encrypt(pass);
	 usuariosCol.find({email:email,password:passCifrada}).toArray(function(error,usr){
		 //console.log(usr);
		 if (usr.length==0){
			 //if(error){
			 //response.redirect("/signup");
			 response.send({'email':''});
		 }
		 else{
			 //response.send({'usuario':usr});
			 juego.agregarUsuario(usr[0]);
			 response.send(usr[0]);
		 }
	 });
});



/*app.post('/login',function(request,response){
	var email=request.body.email;
	var password=request.body.password;
	usuariosCol.find({email:email,password:password}).toArray(function(error,usr){
		if(usr.length==0){
			response.send({'email':''})
		}else{
			juego.agregarUsuario(usr[0]);
			response.send(usr[0]);
		}
	})
});*/

app.post("/signup",function(request,response){
	 //console.log(request.body.email);
	 //console.log(request.body.password);
	 var email=request.body.email;
	 var usu;
	 limboCol.find({email:email}).toArray(function(error,usr){
		 //console.log(usr);
		 if (usr.length==0){
			 //if (usr==undefined){
			 usu=new modelo.Usuario(email);
			 usu.email=email;
			 usu.password=cf.encrypt(request.body.password);
			 persistencia.insertarUsuario(limboCol,usu,function(usu){
			 	moduloEmail.enviarEmail(usu.email,usu.key);
			 	response.send({email:email});
			 });
		 }
		 else{
		 	response.send({email:undefined})
		 }
	 });
});

function insertarUsuario(usu,response){
 //var usuariosCol = db.collection("usuarios");
	 //console.log(usu);
	 usuariosCol.insert(usu,function(err){
		 if(err){
		 	console.log("error");
		 }
		 else{
			 console.log("Nuevo usuario creado");
			 juego.agregarUsuario(usu);
			 //response.send("<h1>Conquista Nieveles: Cuenta Confirmada</h1>");
			 response.redirect("/");
		 }
	 //db.close();
	 });
	 
};



/*function insertarUsuarioLimbo(usu,response){
 //var usuariosCol = db.collection("usuarios");
	 console.log(usu);
	 limboCol.insert(usu,function(err){
		 if(err){
		 	console.log("error");
		 }
		 else{
			 console.log("Nuevo usuario creado");
			 response.send({email:'ok'})
			 moduloEmail.enviarEmail(usu.email,usu.key);
		 }
	 //db.close();
	 });

};*/

/*
function enviarEmail(direccion, key){
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
*/
app.get("/confirmarUsuario/:email/:key",function(request,response){
	 var key=request.params.key;
	 var email= request.params.email;
	 var usuario;

	 limboCol.find({email:email, key:key}).toArray(function(error,usr){
		 //console.log(usr);
		 if (usr.length==0){
			 //if (usr==undefined){
			 console.log("El usuario no existe");
			 response.send("<h1>La cuenta ya está activada<h1>");
		 }
		 else{
		 	
			insertarUsuario(usr[0],response);
			//console.log(usr[0]);
			persistencia.modificarColeccion(limboCol, usr[0]);
			//response.send("<h1>Cuenta activada<h1>");
		 }		 
	 });
});


app.get("/enviarClave/:email",function(request,response){
	 var email= request.params.email;

	 usuariosCol.find({email:email}).toArray(function(error,usr){
		 //console.log(usr);
		 if (usr.length!=0){
			 //if (usr==undefined){
			 moduloEmail.enviarClave(usr[0].email,cf.decrypt(usr[0].password));
			 response.send({email:email})
		 }
		 else{
		 	response.send({email:undefined})
		 }
	 });
});

app.get("/obtenerKeyUsuario/:email/:adminKey",function(request,response){
	 var email= request.params.email;
	 var adminKey= request.params.adminKey;
	 var usuario;

	 //console.log('Administrador: ' + adminKey);

	 if(adminKey=="patata"){

		 limboCol.find({email:email}).toArray(function(error,usr){
			 //console.log(usr);
			 if (usr.length==0){
				 //if (usr==undefined){
				 console.log("El usuario no existe");
				 response.send({key:""});
				 //response.send("<h1>La cuenta ya está activada<h1>");
			 }
			 else{
			 	response.send({key:usr[0].key});
				//insertarUsuario(usr[0],response);
				//modificarEnLimbo(usr[0]._id);
			 }		 
		 });
	}
});

/*
function modificarEnLimbo(uid){
	
	limboCol.findAndModify({_id:ObjectID(uid)},{},{$set:{key:""}},{},function(err,usr){
		 //console.log(usr);
		 if (err){
			 console.log("No se pudo actualizar");
		 }
		 else{
		 	console.log("Usuario del limbo acualizado");
		 }
	});
}*/

app.put("/actualizarUsuario",function(request,response){
 //var uid=request.params.uid;
 //var email=request.body.email;
	 var uid=request.body.uid;

	 //request.body.password= cf.encrypt(request.body.password);
	 //var nombre=request.body.nombre;
	 //var password=request.body.newpass;
	 //var nivel=parseInt(request.body.nivel);
	 var json={'email':undefined};
	 var usu=juego.obtenerUsuario(uid);
	 
	 	if (usu!=undefined){
	 	 console.log(request.body);
		 var usuario=comprobarCambios(request.body,usu);
		 usuariosCol.update({_id:ObjectID(uid)},usuario,function(err,result){
		   //console.log(result);
		   if (result.result.nModified==0){
		     console.log("No se pudo actualizar");
		     response.send(json);
		   }
		   else{ 
		     usuariosCol.find({_id:ObjectID(uid)}).toArray(function(error,usr){
		      if (!error){
		         if (usr.length!=0){
		           json=usr[0];
		         } 
		      }
		     console.log("Usuario modificado");
		     console.log(json);
		     response.send(json);
		    });
		  }
		 }); 
		} else{
			response.send(json);
		}
});

function comprobarCambios(body,usu){
 if (body.email!=usu.email && body.email!=""){
   usu.email=body.email;
 }

 console.log('password:   '+body.newpass);
 if (body.newpass!=undefined && body.newpass!="" && cf.encrypt(body.newpass)!=usu.password){
   console.log(cf.encrypt(body.newpass));
   usu.password=cf.encrypt(body.newpass);
 }
   if (body.nombre!=usu.nombre && body.nombre!=""){
   usu.nombre=body.nombre;
 }
 return usu;
}



app.delete("/eliminarUsuario/:uid",function(request,response){
 var uid=request.params.uid;
 var json={'resultados':-1};
 
 if(ObjectID.isValid(uid)){
	 usuariosCol.remove({_id:ObjectID(uid)},function(err,result){
	  //console.log(result);
	  if (result.result.n==0){
	    console.log("No se pudo eliminar");
	  }
	  else{
	   json={"resultados":1};
	   console.log("Usuario eliminado");
	  }
	  
	 
	  
	  limboCol.remove({_id:ObjectID(uid)},function(err,result){
	  //console.log(result);
	  if (result.result.n==0){
	    console.log("No se pudo eliminar");
	  }
	  else{
	   json={"resultados":1};
	   console.log("Usuario eliminado");
	  }
	  response.send(json);
	  });
	  //response.send(json);
	 });
  }else{
  	response.send(json);
  }
});





function insertar(usu){
	usuariosCol.insert(usu,function(err){
		if(err){
			console.log("error");
		}
		else{

			console.log("Nuevo usuario creado");
			juego.agregarUsuario(usu);
			response.send(usu);
		}
	});

}

function agregarResultado(res){
	console.log(res);
	resultadosCol.find({email:res.email, nivel:res.nivel}).toArray(function(error, usr){
		if(usr.length==0){
			resultadosCol.insert(res,function(err){
				if(err){
					console.log("error");
				}else{
					console.log("nuevo resultado creado")
				}
			});
		}else{
			resultadosCol.update({email:res.email, nivel:res.nivel},res,function(error, result){
				if(result.result.nModified==0){
					console.log("error");
				}else{
					console.log("nuevo resultado creado");	
				}
			});
		}
	})

}


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//var db= new mongo.Db("usuarioscn",new mongo.Server("127.0.0.1","27017",{}));

mongo.connect("mongodb://mario:mario@ds061354.mlab.com:61354/usuarioscn", function(err, db) {
//mongo.connect("mongodb://127.0.0.1:27017/usuarioscn", function(err, db) {
	
	if (err){
		console.log("No pudo conectar a la base de datos")
	}
	else{
		console.log("conectado a Mongo: usuarioscn");
		db.collection("usuarios",function(err,col){
			console.log("tenemos la colección");
			usuariosCol=col;
		});

		db.collection("resultados",function(err,col){
		 	if(err){
			 	console.log("No se puede obtener la colección de resultados");
			 }
			 else{
				 console.log("Tenemos la colección");
				 //juego.agregarUsuario(usu);
				 resultadosCol=col;
			 }
	 	});

	 	db.collection("limbo",function(err,col){
		 	if(err){
			 	console.log("No se puede obtener la colección de limbo");
			 }
			 else{
				 console.log("Tenemos la colección limbo");
				 //juego.agregarUsuario(usu);
				 limboCol=col;
			 }
	 	});
	}
});

var fs=require("fs");
//var config=JSON.parse(fs.readFileSync("config.json"));
//var host=config.host;
//var port=config.port;
var exp=require("express");
var bodyParser=require("body-parser"); 
var mongo=require("mongodb").MongoClient; 
var app=exp(); 
var modelo=require('./servidor/modelo.js');
var ObjectID=require("mongodb").ObjectID;

var juego= new modelo.Juego();
var usuariosCol;

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
	console.log(usuario);
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
	var id=request.params.id;
	var tiempo=request.params.tiempo;
	var usuario=juego.obtenerUsuario(id);
	juego.agregarResultado(new modelo.Resultado(usuario.nombre,usuario.email, usuario.nivel,tiempo));
	usuario.nivel+=1;
	console.log(juego.resultados);
	if (usuario!=undefined){		
		json={'nivel':usuario.nivel};
	}
	response.send(json);
});

app.get('/obtenerResultados/:id',function(request,response){
	var id=request.params.uid;
	var usuario=juego.obtenerUsuario(id);
	var json={'resultados':[]};
	/*if (usuario){
		json=juego.resultados;
		
	}*/
	json=juego.resultados;
	console.log('resultados:');
	console.log(json);
	response.send(json);
});


app.post('/login',function(request,response){
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
});

app.post('/singup',function(request,response){
	var email=request.body.email;
	var password=request.body.password;
	usuariosCol.find({email:email,password:password}).toArray(function(error,usr){
		if(usr.length>0){
			response.send({email:undefined})
		}else{
			var usuario= new modelo.Usuario(email);
				usuario.password=password;
			//insertar(usuario, response);
			usuariosCol.insert(usuario,function(err){
				if(err){
					console.log(err);
					console.log("error");
				}
				else{
					console.log("Nuevo usuario creado");
					juego.agregarUsuario(usuario);
					response.send(usuario);
				}
			});
		}
	})
});


app.put("/actualizarUsuario",function(request,response){
 //var uid=request.params.uid;
 //var email=request.body.email;
 var uid=request.body.uid;
 //var nombre=request.body.nombre;
 //var password=request.body.newpass;
 //var nivel=parseInt(request.body.nivel);
 var json={'email':undefined};
 var usu=juego.obtenerUsuario(uid);
 var usuario=comprobarCambios(request.body,usu);
 usuariosCol.update({_id:ObjectID(uid)},usuario,function(err,result){
   console.log(result);
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
});

function comprobarCambios(body,usu){
 if (body.email!=usu.email && body.email!=""){
   usu.email=body.email;
 }
 if (body.newpass!=usu.password && body.newpass!=""){
   usu.password=body.newpass;
 }
   if (body.nombre!=usu.nombre && body.nombre!=""){
   usu.nombre=body.nombre;
 }
 return usu;
}



app.delete("/eliminarUsuario/:uid",function(request,response){
 var uid=request.params.uid;
 var json={'resultados':-1};
 usuariosCol.remove({_id:ObjectID(uid)},function(err,result){
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
	}
});

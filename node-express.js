
var fs=require("fs");
var config=JSON.parse(fs.readFileSync("config.json"));
var host=config.host;
var port=config.port;
var exp=require("express");
var mongo=require("mongodb");
var app=exp(); 
var modelo=require('./servidor/modelo.js');

var juego= new modelo.Juego();
var usuariosCol;

//app.use(app.router);
app.use(exp.static(__dirname +"/cliente"));

app.get("/",function(request,response){
	var contenido=fs.readFileSync("./cliente/index-nav.html");
	response.setHeader("Content-type","text/html");
	response.send(contenido);
	insertar({nombre:"Pepe", email:"pe@pe.es",clave:"pepe"});
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
	juego.agregarResultado(new modelo.Resultado(usuario.nombre,usuario.nivel,tiempo));
	usuario.nivel+=1;
	console.log(juego.resultados);
	if (usuario!=undefined){		
		json={'nivel':usuario.nivel};
	}
	response.send(json);
});

app.get('/obtenerResultados/:id',function(request,response){
	var id=request.params.id;
	var usuario=juego.obtenerUsuario(id);
	var json={'resultados':[]};
	if (usuario){
		json=juego.resultados;
	}
	response.send(json);
})


console.log("Servidor escuchando en el puerto "+port);
//app.listen(port,host);
app.listen(process.env.PORT || 1338);

var db= new mongo.Db("usuarioscn", new mongo.Server("127.0.0.1","27017",{}));

db.open(function(error){
	console.log("Conectado a mongo: usuarioscn");
	db.collection("usuarios", function(err, col){
		console.log("tenemos la colección");
		usuariosCol=col;
	})
})




function insertar(usu){
	usuariosCol.insert(usu,function(err){
		if(err){
			console.log("error");
		}else{
			console.log("Nuevo usuario Creado");
		}
	})
}


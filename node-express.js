var fs=require("fs");
var config=JSON.parse(fs.readFileSync("config.json"));
var host=config.host;
var port=config.port;
var exp=require("express");
var app=exp(); 
var modelo=require('./servidor/modelo.js')
var juego=new modelo.Juego();

//app.use(app.router);
app.use(exp.static(__dirname +"/cliente"));

app.get("/",function(request,response){
	var contenido=fs.readFileSync("./cliente/index.html");
	response.setHeader("Content-type","text/html");
	response.send(contenido);
});


app.get('/crearUsuario/:nombre', function(request,response){
	//crear usuario con el nombre que recibimos como parametro
	var usuario= new modelo.Usuario(request.params.nombre);
	console.log("Nombre: "+nombre);
});
console.log("Servidor escuchando en el puerto "+port);
app.listen(port,host);


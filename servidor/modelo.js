var _ = require("underscore");
var fs=require("fs");

function Juego(){
	this.nombre="Niveles";
	this.niveles=[];
	this.usuarios=[];
	this.resultados=[];
	this.agregarNivel=function(nivel){
		this.niveles.push(nivel);
	}
	this.agregarUsuario=function(usuario){
		this.usuarios.push(usuario);
	}
	this.obtenerUsuario=function(id){
		return _.find(this.usuarios,function(usu){
			return usu._id==id
		});
	}
	this.agregarResultado=function(resultado){
		this.resultados.push(resultado);
	}
}

function Nivel(num){
	this.nivel=num;
}

function Nivel(num, coord, gravedad){
	this.nivel=num;
	this.coordenadas= coord;
	this.gravedad=gravedad;
}


function Usuario(email, pass){
	this.key=(new Date().valueOf()).toString();
	this.nombre=email.match(/^([^@]*)@/)[1];
	this.nivel=0;
	this.password=pass;
	this.email=email;
}

function Resultado(nombre,nivel,tiempo){
	this.nombre=email;
	this.nivel=nivel;
	this.tiempo=tiempo;
}

function Resultado(nombre, email, nivel,tiempo, fecha){
	this.nombre=nombre;
	this.email=email;
	this.tiempo=tiempo;
	this.nivel=nivel;
	this.fecha= fecha;
}

function JuegoFM(archivo){
	this.juego = new Juego();
	this.array = leerCoordenadas(archivo);

	this.makeJuego=function(juego, array){
		var indi=0;
		array.forEach(function(ele){
			//console.log(ele.gravedad);
			//console.log(ele.coord);
			var nivel= new Nivel(indi, ele.coord, ele.gravedad);
			juego.agregarNivel(nivel);
			indi++;
		});
		return juego;
	}
}

function leerCoordenadas(archivo){
	var array=JSON.parse(fs.readFileSync(archivo));
	return array;
}

module.exports.Juego=Juego;
module.exports.Usuario=Usuario;
module.exports.Resultado=Resultado;
module.exports.JuegoFM=JuegoFM;
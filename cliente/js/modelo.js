function Juego(){//Clase juego
	this.nombre="Niveles";
	this.niveles=[];
	this.usuarios=[];//Lo realiza como si fuera la definición de una clase

	this.agregarNivel=function(nivel){
		this.niveles.push(nivel);
	}

	this.agregarUsuario=function(usuario){
		this.usuarios.push(usuario);
	}


}


function Nivel(num){//Clase Nivel
	this.nivel=num;
}

function Usuario(nombre){//Clase Usuario
	this.nombre=nombre;
	this.nivel=undefined;
}
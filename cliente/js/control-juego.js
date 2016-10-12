
var url="https://pasaniveles.herokuapp.com/";

//Funciones que modifican el index

function inicio(){
	mostrarCabecera();
}

function borrarControl(){
	$('#control').remove();
}

function mostrarCabecera(){
	$('#cabecera').remove();
	$('#control').append('<p id="cabecera"><h3>Nombre Jugador</h3><input type="text" id="nombre" placeholder="introduce tu nombre"></p>');
	botonNombre();
}

function botonNombre(){ 
	var nombre="";
	$('#control').append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md">Iniciar partida</button>');
	$('#nombreBtn').on('click',function(){
		nombre=$('#nombre').val();
		$(d#nombre').remove();
		$('#nombreBtn').remove();		
		crearUsuario(nombre);
	});
}

//Funciones de comunicación con el servidor

function crearUsuario(nombre){
	if (nombre==""){
		nombre="jugador";
	}
	$.getJSON(url+'crearUsuario/'+nombre,function(datos){
		mostrarInfoJugador(datos);
		crearNivel(datos);
	});
	//mostrar datos
	
	
}


function mostrarInfoJugador(datos){
	$('#datos').remove();
	//$('#control').append('<div id="datos">Nombre: '+datos.nombre+' Nivel: '+datos.nivel+' Id:'+datos.id+'</div>');
	$('#control').append('<div id="datosNombre"><h4>'+datos.nombre+'</h4></div>');
	$('#control').append('<div id="datosNivel"><h4>Nivel: '+datos.nivel+'</h4></div>');
	$('#control').append('<div id="datosInformacion"><h5>Utiliza las flechas para moverte. Debes alcanzar el cielo en el menor tiempo posible</h5></div>');
	}


function crearNivel(datos){
	$('#juegoId').append('<script id="nivel">crearNivel()</script>');

}
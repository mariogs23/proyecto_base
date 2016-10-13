
var url="https://pasaniveles.herokuapp.com/";
//var url="http://127.0.0.1:1338/";

//Funciones que modifican el index

function inicio(){
	if($.cookie("nombre")!=undefined){
		comprobarUsuario();
	}else{
		mostrarCabecera();
	}
}

function borrarControl(){
	$('#control').remove();
}

function mostrarCabecera(){
	$('#cabecera').remove();
	$('#control').append('<p id="cabecera"><h3 id="informacion">Nombre Jugador</h3><input type="text" id="nombre" placeholder="introduce tu nombre"></p>');
	botonNombre();
}

function botonNombre(){ 
	var nombre="";
	$('#control').append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md">Iniciar partida</button>');
	$('#nombreBtn').on('click',function(){
		nombre=$('#nombre').val();
		$('#informacion').remove();
		$('#nombre').remove();
		$('#nombreBtn').remove();		
		crearUsuario(nombre);
	});
}


function borrarCookie(){
	$.removeCookie("nombre");
	$.removeCookie("id");
	$.removeCookie("nivel");
}
//Funciones de comunicación con el servidor

function crearUsuario(nombre){
	if (nombre==""){
		nombre="jugador";
	}
	$.getJSON(url+'crearUsuario/'+nombre,function(datos){
		$.cookie('nombre',datos.nombre);
		$.cookie('id',datos.id);
		$.cookie('nivel',datos.nivel);
		mostrarInfoJugador();
	}

	);
	//mostrar datos
	
	
}


function mostrarInfoJugador(){
	var nombre=$.cookie("nombre");
	var nivel=$.cookie("nivel");
	$('#datos').remove();
	//$('#control').append('<div id="datos">Nombre: '+datos.nombre+' Nivel: '+datos.nivel+' Id:'+datos.id+'</div>');
	$('#control').append('<p id="cabecera"><h3>Nombre Jugador</h3>');
	$('#control').append('<div id="datosNombre"><h4>'+nombre+'</h4></div>');
	$('#control').append('<div id="datosNivel"><h4>Nivel: '+nivel+'</h4></div>');
	$('#control').append('<div id="datosInformacion"><h5>Utiliza las flechas para moverte. Debes alcanzar el cielo en el menor tiempo posible</h5></div>');
	siguienteNivel();
}


function siguienteNivel(){
	$('#control').append('<button type="button" id="siguienteBtn" class="btn btn-primary btn-md">Siguiente Nivel</button>');
	$('#siguienteBtn').on('click',function(){
		$('#siguienteBtn').remove();
		crearNivel($.cookie('nivel'));
		//('#juegoId').append('<script id="nivel">crearNivel()</script>');
	});

}

function comprobarUsuario(){
	var id=$.cookie("id");
	//comprobar id
	$.getJSON(url+'comprobarUsuario/'+id,function(datos){
		if(datos.nivel<0){
			//borrar cookies
			borrarCookie();
			mostrarCabecera();
		}else{
			$.cookie("nivel",datos.nivel);
			mostrarInfoJugador();
		}
	});
}


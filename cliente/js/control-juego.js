//funciones que modifican el index
var url="http://127.0.0.1:1338/";

function inicio(){
	mostrarCabecera();
}

function borrarControl(){
	$('#control').remove();
}

function mostrarCabecera(){
	$('#cabecera').remove();
	$('#control').append('<div id="cabecera"> <h2>Panel de Control</h2> <input type ="text" id="nombre" placeholder="introduce tu nombre"> </div>');
	botonNombre();
}


function botonNombre(){
	
	$('#cabecera').append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md">Medium</button>');
	$('#nombreBtn').on('click',function(){
		$('#nombreBtn').remove();
		crearUsuario($('#nombre').val());
	});
};

//funciones de coumnicacion con el servidor

function crearUsuario(nombre){
	if (nombre=""){
		nombre="jugador"
	}
	$.getJSON(url+'crearUsuario/'+nombre,function(datos){
		//datos tiene la respuesta del servidor
		//mostrar los datos del usuario
	});
	//lo que ponga aquí se va a ejecutar en un momento que no puedo controlar

}
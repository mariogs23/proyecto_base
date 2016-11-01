
//var url="http://127.0.0.1:1338/";
var url="https://pasaniveles.herokuapp.com/";

var nombre;
var nivel=-1;
var game;

// function cabecera(){
//   $('#cabecera').remove();
//   $('#inicio').append('<h3 id="cabecera">Nombre jugador</h3>');
// }

function comprobarUsuario(){
  eliminarCabeceras();
  if ($.cookie("uid")!=undefined)
  {
    srvComprobarUsuario();
  }
  else{
    mostrarLogin();
  }
 }

function mostrarLogin(){
  borrarLogin();
  limpiar();
  $('#control').append('<p id="login"><h2 id="cabeceraP">Inicio de sesión</h2><input type="text" id="email" class="form-control" placeholder="introduce tu email" required><input type="password" id="clave" class="form-control" placeholder="introduce tu clave" required></p>');
  $('#control').append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md">Iniciar partida</button> <a href="#" id="refRegistro" onclick="mostrarRegistro();">Registrar usuario</a>');
  $('#nombreBtn').on('click',function(){
    var nombre=$('#email').val();
    var clave=$('#clave').val();
    $('#nombre').remove();
    $('#nombreBtn').remove();   
    loginUsuario(nombre,clave);
  });
}

function mostrarRegistro(){
  borrarLogin();
  limpiar();
  $('#control').append('<p id="cabecera"><h2 id="cabeceraP">Registro de usuarios</h2><input type="text" id="email" class="form-control" placeholder="introduce tu email"><input type="text" id="clave" class="form-control" placeholder="introduce tu clave"></p>');
  $('#control').append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md">Registrar usuario</button>');
  $('#nombreBtn').on('click',function(){
    var nombre=$('#email').val();
    var clave=$('#clave').val();
    $('#nombre').remove();
    $('#nombreBtn').remove();   
    registroUsuario(nombre,clave);
  });
}

function mostrarActualizarEliminar(){
  borrarLogin();
  limpiar();
  if ($.cookie('uid')!=undefined)
  {
    $('#control').append('<p id="cabecera"><h2 id="cabeceraP">Actualizar datos usuario</h2><input type="text" id="email" class="form-control" placeholder="Email: '+$.cookie("email")+'"><input type="text" id="nombre" class="form-control" placeholder="Nombre: '+$.cookie("nombre")+'"><input type="text" id="newpass" class="form-control" placeholder="introduce tu nueva clave"></p>');
    $('#control').append('<button type="button" id="actualizarBtn" class="btn btn-primary btn-md">Actualizar usuario</button> <button type="button" id="eliminarBtn" class="btn btn-danger btn-md">Eliminar usuario</button>');
    $('#actualizarBtn').on('click',function(){
      var email=$('#email').val();
      var nombre=$('#nombre').val();
      var newpass=$('#newpass').val();
      $('#actualizarBtn').remove();   
      actualizarUsuario(email,nombre,newpass);
    });
    $('#eliminarBtn').on('click',function(){
      var nombre=$('#email').val();
      //var clave=$('#clave').val();
      $('#nombre').remove();
      $('#eliminarBtn').remove();   
      eliminarUsuario(nombre);
    });
  }
  else{
    mostrarLogin();
  }
}


function borrarLogin(){
  $('#login').remove();
  $('#email').remove();
  $('#clave').remove();
  $('#nombreBtn').remove();
  $('#cabeceraP').remove();
}

function limpiar(){
  $('#datos').remove();
  $('#cabeceraP').remove();
  $('#cabecera').remove();
  $('#prog').remove();
  $('#cabecera').remove();
  $('#enh').remove();
  $('#siguienteBtn').remove();
  $('#actualizarBtn').remove();
  $('#eliminarBtn').remove();
  $('#refRegistro').remove();
  $('#oldpass').remove();
  $('#newpass').remove();
}

function mostrarInfoJugador(){
  var email=$.cookie("email");
  var id=$.cookie("uid");
  var nivel=$.cookie("nivel");
  var nombre=$.cookie("nombre");
  var percen=Math.floor((nivel/3)*100);
  limpiar();
  borrarLogin();
  $('#control').append('<div id="cabecera"><h2>Panel de Control</h2></div>')
  $('#control').append('<div id="datos"><h4>Email: '+email+'<br />Nombre: '+nombre+'<br />Nivel: '+nivel+'</h4></div>');
  $('#control').append('<div class="progress" id="prog"><div class="progress-bar" aria-valuemin="0" aria-valuemax="100" style="width:'+percen+'%">'+percen+'%</div></div>');
  siguienteNivel();
}

function siguienteNivel(){
  $('#control').append('<button type="button" id="siguienteBtn" class="btn btn-primary btn-md">Siguiente nivel</button>')
  $('#siguienteBtn').on('click',function(){
    $('#siguienteBtn').remove();
    $('#enh').remove();
    $('#res').remove();
    $('#resultados').remove();
    if ($('#juegoId').length==0){
      $('#canvas').append('<div id="juegoId"></div>');
    }
    crearNivel($.cookie('nivel'));
  });
}

function mostrarResultados(datos){
  eliminarGame();
  //eliminarCabeceras();
  $('#juegoId').remove();
  $('#res').remove();
  $('#resultados').remove();
  $('#canvas').append('<h3 id="res">Resultados</h3>');
  var cadena="<table id='resultados' class='table table-bordered table-condensed'><tr><th>Nombre</th><th>Email</th><th>Nivel</th><th>Tiempo</th></tr>";
    for(var i=0;i<datos.length;i++){
      cadena=cadena+"<tr><td>"+datos[i].nombre+"</td><td>"+datos[i].email+"</td><td> "+datos[i].nivel+"</td>"+"</td><td> "+datos[i].tiempo+"</td></tr>";      
    }
    cadena=cadena+"</table>";
    $('#canvas').append(cadena);
}

function noHayNiveles(){
  //$("#juegoId").remove();
  $('#reset').remove();
  $('#control').append('<p id="reset"><button id="reset" type="button" class="btn btn-primary btn-lg">Volver a jugar</button></p>');
  $('#reset').on("click",function(){
      $('#reset').remove();
      $('#canvas').append('<div id="juegoId"></div>');
      reset();
      /*
      $.getScript("js/nivel2.js", function(){
        //Stuff to do after someScript has loaded
        console.log("ok");
      });
      //empezar(nombre);
      */
     });
}

function eliminarCabeceras(){
  $('#resultados').remove();
  $('#res').remove();
  $('#cabecera').remove();
  $('#nombre').remove();
  $('#crear').remove();
  $('#nivel').remove();
  $('#help').remove();  
  $('#reset').remove();
  $('#siguienteBtn').remove();
  $('#juegoId').remove();
  eliminarGame();
}

function reset(){
  eliminarCabeceras();
  eliminarCookies();
  eliminarGame();
  //iniciar();
  comprobarUsuario();
}

function eliminarGame(){
  if (game && game.state!=null) {
    game.destroy();
    //game=undefined;
  }
}

function eliminarCookies(){
  $.removeCookie("uid");
  $.removeCookie("email");
  $.removeCookie("nivel");
  $.removeCookie('nombre');
}

function nivelCompletado(tiempo){
  //game.destroy();
  //game.destroy();
  eliminarGame();
  $('#juegoId').append("<h2 id='enh'>Enhorabuena!</h2>");
  comunicarNivelCompletado(tiempo);
  obtenerResultados();
}


//Comunicaciones

function srvComprobarUsuario(){
  var id=$.cookie("uid");

  $.getJSON(url+'comprobarUsuario/'+id,function(datos){
    if (datos.nivel<0){
      eliminarCookies();
      //mostrarCabecera();
      mostrarLogin();
    }
    else{
      $.cookie("nivel",datos.nivel);
      mostrarInfoJugador();
    }
  });
}

function loginUsuario(nombre,clave){
  //var id=$.cookie("id");

  $.ajax({
    type:'POST',
    url:'/login/',
    data:JSON.stringify({email:nombre,password:clave}),
    success:function(data){
      if (data.email==""){
        mostrarRegistro();
      }
      else{
        $.cookie('nombre',data.nombre);
        $.cookie('email',data.email);
        $.cookie('uid',data._id);
        $.cookie('nivel',data.nivel);
        mostrarInfoJugador();
       }
      },
    contentType:'application/json',
    dataType:'json'
  });
}

function registroUsuario(email, password){

	$.ajax({
		type:'POST',
		url:'/singup/',
		data:JSON.stringify({email:email, password:password}),
		success:function(data){
			if(data.email==undefined){
				mostrarRegistro();
			}else{
				$.cookie('nombre',data.nombre);
		        $.cookie('email',data.email);
		        $.cookie('uid',data._id);
		        $.cookie('nivel',data.nivel);
				mostrarInfoJugador();
			}
		}, 
		contentType:'application/json',
		dataType:'json'
	});
}


function actualizarUsuario(email,nombre,newpass){
  var nivel=$.cookie("nivel");
 $.ajax({
    type:'PUT',
    url:'/actualizarUsuario/',
    data:JSON.stringify({uid:$.cookie("uid"),email:email,nombre:nombre,newpass:newpass,nivel:nivel}),
    success:function(data){
      if (data.email==undefined){
        mostrarRegistro();
      }
      else{
        $.cookie('nombre',data.nombre);
        $.cookie('email',data.email);
        $.cookie('uid',data._id);
        $.cookie('nivel',data.nivel);
        //mostrarActualizarEliminar();
        mostrarInfoJugador();
      }
      },
    contentType:'application/json',
    dataType:'json'
  });
}

/*
function actualizarUsuario(email,nombre,newpass){
	
	var nivel=$.cookie("nivel");

	$.ajax({
		type:'PUT',
		url:'/actualizarUsuario/',
		data:JSON.stringify({uid:$.cookie("uid"),email:email,nombre:nombre,newpass:newpass,nivel:nivel}),
		success:function(data){
			if(data.email==undefined){
				mostrarRegistro();
			}else{
				$.cookie('nombre',data.nombre);
		        $.cookie('email',data.email);
		        $.cookie('uid',data._id);
		        $.cookie('nivel',data.nivel);
				mostrarInfoJugador();
			}
		}, 
		contentType:'application/json',
		dataType:'json'
	});
}
*/

function eliminarUsuario(){
  $.ajax({
    type:'DELETE',
    url:'/eliminarUsuario/'+$.cookie("uid"),
    data:'{}',
    success:function(data){
      if (data.resultados==1)
      {
        reset();
      }
      },
    contentType:'application/json',
    dataType:'json'
  });
}


function comunicarNivelCompletado(tiempo){
  var id=$.cookie("uid");

  $.getJSON(url+'nivelCompletado/'+id+"/"+tiempo,function(datos){
      $.cookie("nivel",datos.nivel);
      mostrarInfoJugador();
  }); 
}


function obtenerResultados(){
  var uid=$.cookie("uid");
  if (uid!=undefined){
    $.getJSON(url+"obtenerResultados/"+uid,function(data){           
        mostrarResultados(data);
    });
  } 
}






//var url="http://127.0.0.1:1338/";
var url="https://pasaniveles.herokuapp.com/";

var nombre;
var nivel=-1;
var game;

function comprobarUsuario(){
  eliminarCabeceras();
  if ($.cookie("uid")!=undefined)
  {
    srvComprobarUsuario();
  }
  else{
    mostrarNavLogin();
    mostrarLogin();
  }
}

function mostrarIntro(){
  var cadena='<h3>Conquista Niveles</h3>';
  $('#intro').append(cadena);
}

function mostrarLogin(){
  limpiar();
  var cadena='<div class="container" id="login"><div class="mainbox col-md-6 col-md-offset-3">';
  cadena=cadena+'<h1 id="cabeceraP" style="color:#E6E6E6;">Inicio de sesión</h1><div id="ig1" class="input-group" style="margin-bottom:25px">';
  cadena=cadena+'<span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>';
  cadena=cadena+'<input id="email" type="text" class="form-control" name="email" placeholder="Escribe tu email"></div>';
  cadena=cadena+'<div id="ig2" class="input-group" style="margin-bottom:25px">';
  cadena=cadena+'<span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>';
  cadena=cadena+'<input id="clave" type="password" class="form-control" name="password" placeholder="Escribe tu clave"></div></div></div>';

  $('#home').append(cadena);
  $('#home').append('<p id="nombreBtn"><button type="button" id="nombreBtn" class="btn btn-primary btn-md" >Iniciar partida</button></p><a href="#" id="refRecordar" style="color:#E6E6E6;">Recordar clave</a>');
  $('#home').append('<h4 id="info"><span class="label label-warning"></span></h4>');
  $('#email').blur(function() {
    var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    if (testEmail.test(this.value) ) 
    {
      $('#nombreBtn').on('click',function(){
        var nombre=$('#email').val();
        var clave=$('#clave').val();
        $('#login').remove();
        $('#nombreBtn').remove();   
        loginUsuario(nombre,clave);
      });
      $('#refRecordar').on('click',function(){
        var nombre=$('#email').val();        
        enviarClave(nombre);
      });
    }
    else {
      mostrarAvisoEmail("Debe ser una dirección de email");
    }
  });
}

function mostrarNavLogin(){
  var strLogin='<li><a href="#" onclick="mostrarRegistro();"><span class="glyphicon glyphicon-user-add"></span> Registrar usuario</a></li>';
  strLogin=strLogin+'<li><a href="#" onclick="mostrarLogin();"><span class="glyphicon glyphicon-log-in"></span> Iniciar sesión</a></li>';

  $('#inicio li').remove();
  $('#inicio').append(strLogin);
}

function mostrarNavLogout(){
  var strLogout='<li><a href="#" onclick="mostrarActualizarEliminar();"><span class="glyphicon glyphicon-user"></span> Modificar perfil</a></li>';
  strLogout = strLogout + '<li><a href="#" onclick="reset();"><span class="glyphicon glyphicon-log-out"></span> Salir</a></li>';

  $('#inicio li').remove();
  $('#inicio').append(strLogout);
}

function mostrarRegistro(){
  limpiar();

  var cadena='<div class="container" id="login"><div class="mainbox col-md-6 col-md-offset-3">';
  cadena=cadena+'<h1 id="cabeceraP" style="color:#E6E6E6;">Nuevo usuario</h1><div id="ig1" class="input-group" style="margin-bottom:25px">';
  cadena=cadena+'<span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>';
  cadena=cadena+'<input id="email" type="text" class="form-control" name="email" placeholder="Escribe tu email"></div>';
  cadena=cadena+'<div id="ig12" class="input-group" style="margin-bottom:25px">';
  cadena=cadena+'<span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>';
  cadena=cadena+'<input id="email2" type="text" class="form-control" name="email" placeholder="Repite el email"></div>';
  cadena=cadena+'<div id="ig2" class="input-group" style="margin-bottom:25px">';
  cadena=cadena+'<span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>';
  cadena=cadena+'<input id="clave" type="password" class="form-control" placeholder="Escribe tu clave"></div></div></div>';

  $('#home').append(cadena);
 
  $('#home').append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md">Registrar usuario</button>');
  $('#home').append('<h4 id="info"><span class="label label-warning"></span></h4>');

  $('#email2').blur(function() {
    var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    var nombre=$('#email').val();
    var nombre2=$('#email2').val();
    if (testEmail.test(this.value)&&comprobarEmail(nombre,nombre2)) 
    {
        $('#nombreBtn').on('click',function(){  
          var clave=$('#clave').val();      
          $('#nombre').remove();
          $('#nombreBtn').remove();   
          registroUsuario(nombre,clave);
        });
    }
    else {
      mostrarAvisoEmail("Debe ser una dirección de email o las direcciones no coinciden");
    }
  });
}

function mostrarSolicitarReenvioMail(){
  $('#reenvio').remove();
  $('#home').append('<button type="button" id="reenvio" class="btn btn-primary btn-md">Reenviar email</button>');
  $('#email').blur(function() {
    var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    if (testEmail.test(this.value)) 
    {
        $('#reenvio').on('click',function(){
        var nombre=$('#email').val();

        reenviarMail(nombre);
      });
    }
    else {
      mostrarAvisoEmail("Debe ser una dirección de email");
    }
  });
}

function mostrarAvisoEmail(cadena){
  $("#info span").text(cadena);
}

function comprobarEmail(cad1,cad2){
  if (cad1==cad2){
    return true;
  }
  else{
    return false;
  }
}

function mostrarActualizarEliminar(){
  limpiar();

  if ($.cookie('uid')!=undefined){
    var email= $.cookie("email");
    var uid= $.cookie("uid");
    var nivel= $.cookie("nivel");
    var nombre= $.cookie("nombre");
  }
  if(uid!=undefined)
  {
    var cadena='<div class="container" id="update"><div class="mainbox col-md-6 col-md-offset-3">';
    cadena=cadena+'<h1 id="cabeceraP" style="color:#E6E6E6;">Actualizar datos usuario</h1><div id="ig1" class="input-group" style="margin-bottom:25px">';
    cadena=cadena+'<span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>';
    cadena=cadena+'<input id="email" type="text" class="form-control" name="email" value="'+email+'"></div>';
    cadena=cadena+'<div id="ig2" class="input-group" style="margin-bottom:25px">';
    cadena=cadena+'<span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>';
    cadena=cadena+'<input id="nombre" type="text" class="form-control" name="nombre" value="'+nombre+'"></div>';
    cadena=cadena+'<div id="ig2" class="input-group" style="margin-bottom:25px">';
    cadena=cadena+'<span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>';
    cadena=cadena+'<input id="clave" type="password" class="form-control" name="password" placeholder="Escribe tu clave"></div></div></div>';

    $('#home').append(cadena);
    $('#home').append('<p id="nombreBtn"><button type="button" id="nombreBtn" class="btn btn-primary btn-md" >Actualizar Usuario</button></p><a href="#" id="eliminarBtn" style="color:#E6E6E6;" class="btn btn-danger btn-md">Eliminar Usuario</a>');
    $('#home').append('<h4 id="info"><span class="label label-warning"></span></h4>');
    
    $('#nombreBtn').on('click',function(){
      var newEmail=$('#email').val();
      var newNombre=$('#nombre').val();
      var newpass=$('#clave').val();

      $('#email').val(function() {
        var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
        if (testEmail.test(this.value) ) 
        {
          $('#update').remove();
          $('#nombreBtn').remove();   
          actualizarUsuario(newEmail,newNombre,newpass);
        }else {
          mostrarAvisoEmail("Debe ser una dirección de email");
        }
      });
    });
    $('#eliminarBtn').on('click',function(){
      var nombre=$('#email').val();
      $('#update').remove();
      $('#nombreBtn').remove();   
      eliminarUsuario(nombre);
    });  
  }else{
    mostrarLogin();
  }
}

function limpiar(){
  $('#ig1').remove();
  $('#ig12').remove();
  $('#ig2').remove();
  $('#login').remove();
  $('#update').remove();
  $('#email').remove();
  $('#clave').remove();
  $('#nombreBtn').remove();
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
  $('#nombre').remove();
  $('#newpass').remove();
  $('#tabla').remove();
  $('#tabla_wrapper').remove();
  $('#info').remove();
  $('#panel').remove();
  $('#reenvio').remove();
  $('#refRecordar').remove();
  $('#datos2').remove();
  $('#tab').remove();
}

function mostrarInfoJugador(){
  var email= $.cookie("email");
  var id= $.cookie("uid");
  var nivel= $.cookie("nivel");
  var nombre= $.cookie("nombre");
  var max=3;

  mostrarNavLogout();

  var percen=Math.floor((nivel/max)*100);
  limpiar();
  $('p').remove();
  var cadena='<div id="cabecera" class="panel panel-default"><div class="panel-heading"><h3>Información del juego</h3></div>';
  cadena=cadena+'<div id="datos" class="panel-body"><p id="datos2"><strong>Email:</strong> '+email+'</p><p id="datos2"><strong>Nombre:</strong> '+nombre+'</p><p id="datos2"><strong>Nivel:</strong> '+nivel+' </p><p id="datos2"><strong>Progreso:</strong> '+percen+'% completado</p></div></div>';
  $('#control').append(cadena);
  
  siguienteNivel();
  obtenerResultados();
}

function mostrarPanel(){
  $('#panel').remove();
  var cadena="<div id='panel' class='panel panel-default'>";
  cadena=cadena+"<div class='panel-heading'><h4>Últimos logros de otros jugadores</h4></div>";
  cadena=cadena+"<div class='panel-body' id='noticias'></div></div>";
  $('#control').append(cadena);
}

function mostrarAviso(aviso){
   $('#control').append('<div id="cabecera"><h5>'+aviso+'</h5></div>')
}

function siguienteNivel(){
  $('#control').append('<button type="button" id="siguienteBtn" class="btn btn-primary btn-md">Siguiente nivel</button>')
  $('#siguienteBtn').on('click',function(){
    $('#siguienteBtn').remove();
    $('#enh').remove();
    $('#res').remove();
    $('#resultados').remove();
    $('#tab').remove();
    if ($('#juegoId').length==0){
      $('#canvas').append('<div id="juegoId"></div>');
    }
    pedirNivel();
  });
}

function mostrarResultados(datos){
  eliminarGame();
  $('#juegoId').remove();
  $('#tab').remove();

  var cadena='<div id="tab" class="panel panel-default"><div class="panel-heading"><h3 >Resultados</h3></div><ul class="nav nav-tabs">';
  cadena=cadena+'<li class="active"><a href="#resultados" data-toggle="tab">Todos</a></li>'
  cadena=cadena+'<li><a href="#mislogros" data-toggle="tab">Mis logros</a></li>'
  cadena=cadena+'<li><a href="#losmejores" data-toggle="tab">Los mejores</a></li></ul>'
  cadena=cadena+'<div class="tab-content">';
  cadena=cadena+"<div class='tab-pane active' id='resultados'>";
  cadena=cadena+obtenerTodos(datos);
  cadena=cadena+'</div>';
  cadena=cadena+"<div class='tab-pane' id='mislogros'>";
  cadena=cadena+obtenerMisLogros(datos);
  cadena=cadena+'</div>';
  cadena=cadena+"<div class='tab-pane' id='losmejores'>";
  cadena=cadena+obtenerLosMejores(datos);
  cadena=cadena+'</div>';
  cadena=cadena+'</div><div class="paging-container" id="demo"> </div>';
  cadena=cadena+'</div>';

  $('#canvas').append(cadena); 
  mostrarControlPaginas(datos.length);
}

function eliminarResultados(){
  $('#res').remove();
  $('#resultados').remove();
}

function mostrarControlPaginas(max){
  Pagination('#demo',{
          itemsCount: max,
          pageSize: 10,
          onPageSizeChange: function (ps) {
            console.log('changed to ' + ps);
          },
          onPageChange: function (paging) {

            var start = paging.pageSize * (paging.currentPage - 1),
              end = start + paging.pageSize,
              $rows = $('#table').find('.data');

            $rows.hide();

            for (var i = start; i < end; i++) {
              $rows.eq(i).show();
            }
          }
        });
}

function obtenerTodos(datos){
  var cadena="<table id='table' class='table table-bordered table-condensed table-striped'><thead><tr><th>Nombre</th><th>Fecha</th><th>Nivel</th><th>Tiempo</th></tr></thead>";
  cadena=cadena+'<tbody>';
  for(var i=0;i<datos.length;i++){
      var fecha=new Date(datos[i].fecha);
      var strFecha=fecha.getDate()+'/'+(fecha.getMonth()+1)+'/'+fecha.getFullYear()+'  '+fecha.getHours()+':'+fecha.getMinutes();
      cadena=cadena+"<tr class='data'><td>"+datos[i].nombre+"</td><td>"+strFecha+"</td><td> "+datos[i].nivel+"</td>"+"</td><td> "+datos[i].tiempo+"</td></tr>";      
    }
    cadena=cadena+"</tbody></table>";
  return cadena;
}

function obtenerMisLogros(datos){
  var miEmail=$.cookie("email");
  misDatos=_.sortBy(_.filter(datos,function(each){
    return each.email==miEmail
  }),'nivel');  
  var cadena="<table class='table table-bordered table-condensed table-striped'><tr><th>Nombre</th><th>Fecha</th><th>Nivel</th><th>Tiempo</th></tr>";
  for(var i=0;i<misDatos.length;i++){ 
      var fecha=new Date(misDatos[i].fecha);
      var strFecha=fecha.getDate()+'/'+(fecha.getMonth()+1)+'/'+fecha.getFullYear()+'  '+fecha.getHours()+':'+fecha.getMinutes();
      cadena=cadena+"<tr><td>"+misDatos[i].nombre+"</td><td>"+strFecha+"</td><td> "+misDatos[i].nivel+"</td>"+"</td><td> "+misDatos[i].tiempo+"</td></tr>";      
    }
    cadena=cadena+"</table>";
  return cadena;
}

function obtenerLosMejores(datos){
  var miEmail=$.cookie("email");
  var max=3;
  var nuevaCol=[];

  for(var i=0;i<max;i++){
    nuevaCol.push(_.min(_.filter(datos,function(each){
      return each.nivel==i;
    }),function(ele){
      return ele.tiempo;
    }))
  }
  var cadena="<table class='table table-bordered table-condensed table-striped'><tr><th>Nombre</th><th>Fecha</th><th>Nivel</th><th>Tiempo</th></tr>";
  
  for(var i=0;i<nuevaCol.length;i++){ 

      var fecha=new Date(nuevaCol[i].fecha);
      var strFecha=fecha.getDate()+'/'+(fecha.getMonth()+1)+'/'+fecha.getFullYear()+'  '+fecha.getHours()+':'+fecha.getMinutes();
      cadena=cadena+"<tr><td>"+nuevaCol[i].nombre+"</td><td>"+strFecha+"</td><td> "+nuevaCol[i].nivel+"</td>"+"</td><td> "+nuevaCol[i].tiempo+"</td></tr>";      
    }
    cadena=cadena+"</table>";
  return cadena;
}

function noHayNiveles(){
  $('#reset').remove();
  $('#control').append('<p id="reset"><button id="reset" type="button" class="btn btn-primary btn-lg">Volver a jugar</button></p>');
  $('#reset').on("click",function(){
      volverAJugar();
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
  mostrarNavLogin();
  comprobarUsuario();
}

function eliminarGame(){
  if (game && game.state!=null) {
    game.destroy();
  }
}

function eliminarCookies(){
  $.removeCookie("uid");
  $.removeCookie("email");
  $.removeCookie("nivel");
  $.removeCookie('nombre');
}

function nivelCompletado(tiempo){
  var id=$.cookie("uid");
  console.log(tiempo);
  eliminarGame();
  //$('#juegoId').append("<h2 id='enh'>Enhorabuena!</h2>");
  comunicarNivelCompletado(tiempo);
}

//COMUNICACIONES
function srvComprobarUsuario(){
  var id=$.cookie("uid");

  $.getJSON(url+'comprobarUsuario/'+id,function(datos){
    if (datos.nivel<0){
      eliminarCookies();
      mostrarLogin();
    }
    else{
      $.cookie("nivel",datos.nivel);
      mostrarInfoJugador();
    }
  });
}

function loginUsuario(nombre,clave){
  $.ajax({
    type:'POST',
    url:'/login/',
    data:JSON.stringify({email:nombre,password:clave}),
    success:function(data){
      if (data.email==""){
        mostrarLogin();
        mostrarAvisoEmail("Usuario o clave incorrectos");
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

function registroUsuario(nombre,clave){
  $.ajax({
    type:'POST',
    url:'/signup/',
    data:JSON.stringify({email:nombre,password:clave}),
    success:function(data){
      if (data.email==undefined){
        mostrarRegistro();
      }
      else{
        
        $.cookie('nombre',data.nombre);
        $.cookie('email',data.email);
        $.cookie('uid',data._id);
        $.cookie('nivel',data.nivel);
        
        mostrarLogin();
        mostrarAvisoEmail("Te hemos enviado un email para confirmar tu cuenta");
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
        mostrarActualizarEliminar();
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

function eliminarUsuario(){
  $.ajax({
    type:'DELETE',
    url:'/eliminarUsuario/'+$.cookie("uid"),
    data:'{}',
    success:function(data){
      if (data.resultados==1)
      {
        reset();
      }else{
        mostrarInfoJugador();
      }
    },
    contentType:'application/json',
    dataType:'json'
  });
}

function comunicarNivelCompletado(tiempo){
  var id=$.cookie("uid");
  console.log(tiempo);

  $.getJSON(url+'nivelCompletado/'+id+"/"+tiempo,function(data){
      $.cookie("nivel",data.nivel);
      mostrarInfoJugador();
      obtenerResultados();
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

function pedirNivel(){
  var uid= $.cookie("uid");
  if (uid!=undefined){
    $.getJSON(url+"pedirNivel/"+uid, function(data){
      crearNivel(data);
    });
  }
}

function volverAJugar(){
  var uid= $.cookie("uid");
  if (uid!=undefined){
    $.getJSON(url+"volverAJugar/"+uid,function(data){    
        if(data.nivel!=undefined){
          $.cookie('nombre',data.nombre);
          $.cookie('email',data.email);
          $.cookie('uid',data._id);
          $.cookie('nivel',data.nivel);

          mostrarInfoJugador();
        }
    });
  } 
}

function reenviarMail(email){
  $.getJSON("/volverAEnviarMail/"+email,function(data){    
      if (data.email==undefined){
        mostrarRegistro();
        mostrarAvisoEmail("Dirección de email inventada o el usuario ya existe");
        mostrarSolicitarReenvioMail();
      }
      else{
         mostrarLogin();
         mostrarAvisoEmail("Te hemos enviado un email para confirmar tu cuenta");
      }
    });
}

function enviarClave(email){
  if (email==undefined){
    mostrarLogin();
    mostrarAvisoEmail("Introduce usuario");
  }
  else{
    $.getJSON("/enviarClave/"+email,function(data){
        if (data.email==""){
          mostrarRegistro();
          mostrarAvisoEmail("Dirección de email inventada o el usuario ya existe");
          mostrarSolicitarReenvioMail();
        }
        else{
           mostrarLogin();
           mostrarAvisoEmail("Te hemos enviado un email para recordarte tu contraseña");
        }
      });
  }
}
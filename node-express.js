
var fs=require("fs");

//var url="http://127.0.0.1:1338/";
var url="https://pasaniveles.herokuapp.com/";

var exp=require("express");
var bodyParser=require("body-parser"); 
var mongo=require("mongodb").MongoClient; 
var app=exp(); 
var modelo=require('./servidor/modelo.js');
var ObjectID=require("mongodb").ObjectID;

var cf=require("./servidor/cifrado.js");

var persistencia=require("./servidor/persistencia.js");

var moduloEmail=require("./servidor/email.js");
var fm=new modelo.JuegoFM("./servidor/coordenadas.json");
var juego= fm.makeJuego(fm.juego, fm.array);


var usuariosCol;
var resultadosCol;
var limboCol;


//////////////////////////////////////////////////
///////////////////MÉTODOS APP////////////////////
//////////////////////////////////////////////////
app.set('port', (process.env.PORT || 1338));

app.use(exp.static(__dirname +"/cliente"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


app.get("/",function(request,response){
	var contenido=fs.readFileSync("./cliente/index-nav.html");
	response.setHeader("Content-type","text/html");
	response.send(contenido);
});

app.get('/crearUsuario/:nombre',function(request,response){
	var usuario= new modelo.Usuario(request.params.nombre);
	juego.agregarUsuario(usuario);
	var id=usuario.id;
	usuario=juego.obtenerUsuario(id);
	response.send({'nombre':usuario.nombre,'nivel':usuario.nivel,'id':usuario.id});
});

app.get('/comprobarUsuario/:id',function(request,response){
	var id=request.params.id;
	var usuario=juego.obtenerUsuario(id);
	var json={'nivel':-1};
	if (usuario!=undefined){		
		json={'nivel':usuario.nivel};
	}
	response.send(json);
});

app.get('/nivelCompletado/:id/:tiempo',function(request,response){
	var uid=request.params.id;
	var tiempo=request.params.tiempo;
	var usuario=juego.obtenerUsuario(uid);
	
	if(usuario!=undefined){
		
		persistencia.agregarResultado(new modelo.Resultado(usuario.nombre,usuario.email, usuario.nivel,tiempo, (new Date().valueOf())),resultadosCol, usuario);
		usuario.nivel=usuario.nivel+1;
		
		persistencia.actualizarColeccion(usuariosCol, uid, usuario, function(result){
			if (result.result.nModified==0){
			    console.log("No se pudo actualizar");
			    response.send({'nivel':-1});
		   	}else{ 
		   		persistencia.encontrarColeccionId(usuariosCol, uid, function(usr){
					if (usr.length!=0){
		           		json=usr[0];
		         	} 
		         	console.log("Usuario modificado");
		     		response.send({'nivel':usr[0].nivel});
				});
		   	}
		});

		/*usuariosCol.update({_id:ObjectID(uid)},usuario,function(err,result){
		   if (result.result.nModified==0){
		     console.log("No se pudo actualizar");
		     response.send({'nivel':-1});
		   }
		   else{ 
		     usuariosCol.find({_id:ObjectID(uid)}).toArray(function(error,usr){
		      if (!error){
		         if (usr.length!=0){
		           json=usr[0];
		         } 
		      }
		     console.log("Usuario modificado");
		     response.send({'nivel':usr[0].nivel});
		    });
		  }
		});*/
	}else{
		response.send({'nivel':-1});
	}
});

app.get('/obtenerResultados/:id',function(request,response){
	var id=request.params.uid;
	var usuario=juego.obtenerUsuario(id);
	var json={'resultados':[]};

	
	persistencia.encontrarColeccion(resultadosCol, function(result){
		if (result.length!=0){
       		json=result;
     	} 
     	console.log("Resultados encontrados");
 		response.send(json);
	});
	/*resultadosCol.find().toArray(function(error,result){
		      if (!error){
		         if (result.length!=0){
		           json=result;
		         } 
		      }
		     console.log("Usuario modificado");
		     response.send(json);
	});*/

});

app.get('/obtenerUid/:email/:key',function(request,response){
	var email=request.params.email;
	var key=request.params.key;
	
	var json={uid:-1};

	persistencia.encontrarColeccionIdKey(limboCol, email, key, function(usr){
         if (usr.length!=0){
           json={uid:usr[0]._id};
         } 
	     response.send(json);
	});

	/*limboCol.find({email:email,key:key}).toArray(function(error,usr){
	         if (usr.length!=0){
	           json={uid:usr[0]._id};
	         } 
		     response.send(json);
	});*/

});

app.get("/pedirNivel/:uid",function(request,response){
 var uid=request.params.uid;
 var usuario=juego.obtenerUsuario(uid);
 var json={'nivel':-1};

  if (usuario && usuario.nivel<juego.niveles.length){
    response.send(juego.niveles[usuario.nivel]);
  }
  else{
   	response.send(json);
  }
  
});

app.get('/volverAJugar/:uid',function(request,response){
	var uid=request.params.uid;
 	var usuario=juego.obtenerUsuario(uid);
	usuario.nivel=0;
	var json={'email':undefined};

	//console.log(usuario);
		
		persistencia.actualizarColeccion(usuariosCol, usuario._id, usuario, function(result){
			if (result.result.nModified==0){
			    console.log("No se pudo actualizar");
			    response.send(usuario);
		   	}else{ 
		   		persistencia.encontrarColeccionId(usuariosCol, usuario._id, function(usr){
					if (usr.length!=0){
		           		json=usr[0];
		         	} 
		         	console.log("Usuario modificado");
		     		response.send(json);
				});
		   	}
		});


		/*usuariosCol.update({_id:ObjectID(usuario._id)},usuario,function(err,result){
		   if (result.nModified==0){
			    console.log("No se pudo actualizar");
			    response.send(json);
		   }
		   else{ 
			     usuariosCol.find({_id:ObjectID(usuario._id)}).toArray(function(error,usr){
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
		});*/

});

app.get("/confirmarUsuario/:email/:key",function(request,response){
	 var key=request.params.key;
	 var email= request.params.email;
	 var usuario;

	 persistencia.encontrarColeccionIdKey(limboCol, email, key, function(usr){
         if (usr.length==0){
           console.log("El usuario no existe");
		   response.send("<h1>La cuenta ya está activada<h1>");
         } else{
		 	
			//insertarUsuario(usr[0],response);
			persistencia.insertarUsuario(usuariosCol,usr[0],function(usu){
			 	juego.agregarUsuario(usu);
			 	response.redirect("/");
			});
			persistencia.modificarColeccion(limboCol, usr[0]);
		 }
	     
	 });

	 /*limboCol.find({email:email, key:key}).toArray(function(error,usr){
		 if (usr.length==0){
			 console.log("El usuario no existe");
			 response.send("<h1>La cuenta ya está activada<h1>");
		 }
		 else{
		 	
			//insertarUsuario(usr[0],response);
			persistencia.insertarUsuario(usuariosCol,usr[0],function(usu){
			 	juego.agregarUsuario(usu);
			 	response.redirect("/");
			});
			persistencia.modificarColeccion(limboCol, usr[0]);
		 }		 
	 });*/
});


app.get("/enviarClave/:email",function(request,response){
	 var email= request.params.email;

	 persistencia.encontrarColeccionEmail(usuariosCol, email, function(usr){
		 if (usr.length!=0){
       	 	 var cadena= '<body><div autoid="_rp_D" class="_rp_i5">  <div class="itemPartBody _rp_k5 ms-font-weight-regular ms-font-color-neutralDark" style="display: none;"></div>  <div autoid="_rp_E" class="_rp_j5" style="display: none;"></div>  <div><div autoid="_rp_F" class="_rp_j5 rpHighlightAllClass rpHighlightBodyClass allowTextSelection" role="region" aria-label="Cuerpo del mensaje">   <div style="display: none;"></div> <div style="display: none;"></div>  <div>  <div class="_rp_k5 ms-font-weight-regular ms-font-color-neutralDark" role="presentation" tabindex="-1"><div class="rps_7970"><div><div><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td align="center" style="color:#696969; font:10px Arial">&nbsp;</td></tr></tbody></table><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#2d69b8"><tbody><tr><td style="padding:0 0 40px"><table width="684" border="0" cellspacing="0" cellpadding="0" bgcolor="#2d69b8" align="center"><tbody><tr<td rowspan="2" width="405" height="137"><a href="https://pasaniveles.herokuapp.com/" target="_blank"><h1 width="405" height="137" border="0" style="color:#FFF; font:bold 25px Arial; display:block"></a> </td><td colspan="7" height="102">&nbsp;</td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/mundijuegos/background.png" colspan="8"><table width="684" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td width="42">&nbsp;</td><td width="600" bgcolor="#f5f5f5" style="padding-top:19px"><div style="color:#1a52b8; font:bold 24px ,Arial; line-height:30px; padding-left:50px; padding-right:50px; padding-bottom:19px"><span class="highlight" id="0.26437121236652006" name="searchHitInReadingPane">Pasa Niveles</span></div><table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFFFFF"><tbody><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_up.png" height="16" colspan="3"></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_bg.png" style="padding-left:65px; padding-right:65px; padding-top:15px; padding-bottom:15px; color:#4f4f4f; font:12px Arial"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td><b style="font-size:14px">Hola '+usr[0].nombre+'</b><br><br>Has solucitado el recordatorio de tu contraseña, la cual es:<br><br> <b style="font-size:14px">'+cf.decrypt(usr[0].password)+'</b> <br><br>Para empezar a jugar pulsa el siguiente botón: <br><br><table background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/button-green.png" width="233" align="center" height="72" border="0" cellspacing="0" cellpadding="0" bgcolor="#7bc71e"><tbody><tr><td align="center" valign="middle"><a href= "'+url+'" target="_blank" style="color:#FFF; font:bold 18px Tahoma,Arial; line-height:60px; text-decoration:none; display:block; width:233px; line-height:24px">Jugar ahora</a> </td></tr></tbody></table><br><br>Esperamos que disfrutes del juego.<br>El equipo de <b><span class="highlight" id="0.5966038671217082" name="searchHitInReadingPane">Pasa Niveles</span></b></td><td width="136" align="right" valign="top"><img src="http://d4tkw3ysp08j4.cloudfront.net/newavatarv3/maxi/03841302c08000500000000000000003e0000000000ca8410800000044a48a88888890.jpg?updated=1483471434" width="136" height="153" alt="Tu avatar" style="font-size:10px"> </td></tr></tbody></table></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_down.png" height="21" colspan="3"></td></tr></tbody></table><br><br></td><td width="42">&nbsp;</td></tr></tbody></table></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/mundijuegos/footer.png" colspan="8" valign="middle" height="124" style="padding-left:60px; padding-right:60px; text-align:left; color:#d1d1d1; font:11px Arial"><div style="padding-bottom:12px">No respondas ni reenvies este email, puede contener información confidencial sobre tu cuenta.<br>Servicio ofrecido por <a href="https://pasaniveles.herokuapp.com/" target="_blank" style="text-decoration:underline; color:#dddddd"><span class="highlight" id="0.36861047654943846" name="searchHitInReadingPane">Pasa Niveles</span>.com</a> </div></td></tr></tbody></table></td></tr></tbody></table><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"></table> <div style="display: none;"></div> </div> </div></div> <div style="display: none;"></div> </div></body>';	
			 moduloEmail.enviarEmail(usr[0].email,cadena);
			 response.send({email:email})
     	 }else{
		 	response.send({email:undefined})
		 }
	 });
	 
	 /*usuariosCol.find({email:email}).toArray(function(error,usr){
		 if (usr.length!=0){
			 var cadena= '<body><div autoid="_rp_D" class="_rp_i5">  <div class="itemPartBody _rp_k5 ms-font-weight-regular ms-font-color-neutralDark" style="display: none;"></div>  <div autoid="_rp_E" class="_rp_j5" style="display: none;"></div>  <div><div autoid="_rp_F" class="_rp_j5 rpHighlightAllClass rpHighlightBodyClass allowTextSelection" role="region" aria-label="Cuerpo del mensaje">   <div style="display: none;"></div> <div style="display: none;"></div>  <div>  <div class="_rp_k5 ms-font-weight-regular ms-font-color-neutralDark" role="presentation" tabindex="-1"><div class="rps_7970"><div><div><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td align="center" style="color:#696969; font:10px Arial">&nbsp;</td></tr></tbody></table><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#2d69b8"><tbody><tr><td style="padding:0 0 40px"><table width="684" border="0" cellspacing="0" cellpadding="0" bgcolor="#2d69b8" align="center"><tbody><tr<td rowspan="2" width="405" height="137"><a href="https://pasaniveles.herokuapp.com/" target="_blank"><h1 width="405" height="137" border="0" style="color:#FFF; font:bold 25px Arial; display:block"></a> </td><td colspan="7" height="102">&nbsp;</td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/mundijuegos/background.png" colspan="8"><table width="684" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td width="42">&nbsp;</td><td width="600" bgcolor="#f5f5f5" style="padding-top:19px"><div style="color:#1a52b8; font:bold 24px ,Arial; line-height:30px; padding-left:50px; padding-right:50px; padding-bottom:19px"><span class="highlight" id="0.26437121236652006" name="searchHitInReadingPane">Pasa Niveles</span></div><table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFFFFF"><tbody><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_up.png" height="16" colspan="3"></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_bg.png" style="padding-left:65px; padding-right:65px; padding-top:15px; padding-bottom:15px; color:#4f4f4f; font:12px Arial"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td><b style="font-size:14px">Hola '+usr[0].nombre+'</b><br><br>Has solucitado el recordatorio de tu contraseña, la cual es:<br><br> <b style="font-size:14px">'+cf.decrypt(usr[0].password)+'</b> <br><br>Para empezar a jugar pulsa el siguiente botón: <br><br><table background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/button-green.png" width="233" align="center" height="72" border="0" cellspacing="0" cellpadding="0" bgcolor="#7bc71e"><tbody><tr><td align="center" valign="middle"><a href= "'+url+'" target="_blank" style="color:#FFF; font:bold 18px Tahoma,Arial; line-height:60px; text-decoration:none; display:block; width:233px; line-height:24px">Jugar ahora</a> </td></tr></tbody></table><br><br>Esperamos que disfrutes del juego.<br>El equipo de <b><span class="highlight" id="0.5966038671217082" name="searchHitInReadingPane">Pasa Niveles</span></b></td><td width="136" align="right" valign="top"><img src="http://d4tkw3ysp08j4.cloudfront.net/newavatarv3/maxi/03841302c08000500000000000000003e0000000000ca8410800000044a48a88888890.jpg?updated=1483471434" width="136" height="153" alt="Tu avatar" style="font-size:10px"> </td></tr></tbody></table></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_down.png" height="21" colspan="3"></td></tr></tbody></table><br><br></td><td width="42">&nbsp;</td></tr></tbody></table></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/mundijuegos/footer.png" colspan="8" valign="middle" height="124" style="padding-left:60px; padding-right:60px; text-align:left; color:#d1d1d1; font:11px Arial"><div style="padding-bottom:12px">No respondas ni reenvies este email, puede contener información confidencial sobre tu cuenta.<br>Servicio ofrecido por <a href="https://pasaniveles.herokuapp.com/" target="_blank" style="text-decoration:underline; color:#dddddd"><span class="highlight" id="0.36861047654943846" name="searchHitInReadingPane">Pasa Niveles</span>.com</a> </div></td></tr></tbody></table></td></tr></tbody></table><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"></table> <div style="display: none;"></div> </div> </div></div> <div style="display: none;"></div> </div></body>';	
			 moduloEmail.enviarEmail(usr[0].email,cadena);
			 response.send({email:email})
		 }
		 else{
		 	response.send({email:undefined})
		 }
	 });*/
});

app.get("/obtenerKeyUsuario/:email/:adminKey",function(request,response){
	 var email= request.params.email;
	 var adminKey= request.params.adminKey;
	 var usuario;

	 if(adminKey=="patata"){
	 	 persistencia.encontrarColeccionEmail(limboCol, email, function(usr){
			 if (usr.length==0){
	       	 	 console.log("El usuario no existe");
				 response.send({key:""});
	     	 }else{
			 	response.send({key:usr[0].key});
			 }
	 	 });
	 
		 /*limboCol.find({email:email}).toArray(function(error,usr){
			 if (usr.length==0){
				 console.log("El usuario no existe");
				 response.send({key:""});
			 }
			 else{
			 	response.send({key:usr[0].key});
			 }		 
		 });*/
	}
});

app.post("/login",function(request,response){
	 var email=request.body.email;
	 var pass=request.body.password;
	 var passCifrada= cf.encrypt(pass);

	 persistencia.encontrarColeccionIdPassword(usuariosCol, email, passCifrada, function(usr){
         if (usr.length==0){
           response.send({'email':''});
         }else{
			 juego.agregarUsuario(usr[0]);
			 response.send(usr[0]);
		 }
	 });

	 /*usuariosCol.find({email:email,password:passCifrada}).toArray(function(error,usr){
		 if (usr.length==0){
			 response.send({'email':''});
		 }
		 else{
			 juego.agregarUsuario(usr[0]);
			 response.send(usr[0]);
		 }
	 });*/
});

app.post("/signup",function(request,response){
	 var email=request.body.email;
	 var usu;

	 persistencia.encontrarColeccionEmail(limboCol, email, function(usr){
		 if (usr.length==0){
			 usu=new modelo.Usuario(email, cf.encrypt(request.body.password));
			 persistencia.insertarUsuario(limboCol,usu,function(usu){
			 	var cadena= '<body><div autoid="_rp_D" class="_rp_i5">  <div class="itemPartBody _rp_k5 ms-font-weight-regular ms-font-color-neutralDark" style="display: none;"></div>  <div autoid="_rp_E" class="_rp_j5" style="display: none;"></div>  <div><div autoid="_rp_F" class="_rp_j5 rpHighlightAllClass rpHighlightBodyClass allowTextSelection" role="region" aria-label="Cuerpo del mensaje">   <div style="display: none;"></div> <div style="display: none;"></div>  <div>  <div class="_rp_k5 ms-font-weight-regular ms-font-color-neutralDark" role="presentation" tabindex="-1"><div class="rps_7970"><div><div><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td align="center" style="color:#696969; font:10px Arial">&nbsp;</td></tr></tbody></table><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#2d69b8"><tbody><tr><td style="padding:0 0 40px"><table width="684" border="0" cellspacing="0" cellpadding="0" bgcolor="#2d69b8" align="center"><tbody><tr<td rowspan="2" width="405" height="137"><a href="https://pasaniveles.herokuapp.com/" target="_blank"><h1 width="405" height="137" border="0" style="color:#FFF; font:bold 25px Arial; display:block"></a> </td><td colspan="7" height="102">&nbsp;</td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/mundijuegos/background.png" colspan="8"><table width="684" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td width="42">&nbsp;</td><td width="600" bgcolor="#f5f5f5" style="padding-top:19px"><div style="color:#1a52b8; font:bold 24px ,Arial; line-height:30px; padding-left:50px; padding-right:50px; padding-bottom:19px">Bienvenido a <span class="highlight" id="0.26437121236652006" name="searchHitInReadingPane">Pasa Niveles</span></div><table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFFFFF"><tbody><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_up.png" height="16" colspan="3"></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_bg.png" style="padding-left:65px; padding-right:65px; padding-top:15px; padding-bottom:15px; color:#4f4f4f; font:12px Arial"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td><b style="font-size:14px">Hola '+usu.nombre+'</b><br><br>¡Felicidades! ¡Ya eres un jugador registrado! Para finalizar tu registro y empezar a jugar pulsa el siguiente botón:<br><br><table background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/button-green.png" width="233" align="center" height="72" border="0" cellspacing="0" cellpadding="0" bgcolor="#7bc71e"><tbody><tr><td align="center" valign="middle"><a href= "'+url+'confirmarUsuario/'+usu.email+'/'+usu.key+'" target="_blank" style="color:#FFF; font:bold 18px Tahoma,Arial; line-height:60px; text-decoration:none; display:block; width:233px; line-height:24px">Jugar ahora</a> </td></tr></tbody></table><br><br>Esperamos que disfrutes del juego.<br>El equipo de <b><span class="highlight" id="0.5966038671217082" name="searchHitInReadingPane">Pasa Niveles</span></b></td><td width="136" align="right" valign="top"><img src="http://d4tkw3ysp08j4.cloudfront.net/newavatarv3/maxi/03841302c08000500000000000000003e0000000000ca8410800000044a48a88888890.jpg?updated=1483471434" width="136" height="153" alt="Tu avatar" style="font-size:10px"> </td></tr></tbody></table></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_down.png" height="21" colspan="3"></td></tr></tbody></table><br><br></td><td width="42">&nbsp;</td></tr></tbody></table></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/mundijuegos/footer.png" colspan="8" valign="middle" height="124" style="padding-left:60px; padding-right:60px; text-align:left; color:#d1d1d1; font:11px Arial"><div style="padding-bottom:12px">No respondas ni reenvies este email, puede contener información confidencial sobre tu cuenta.<br>Servicio ofrecido por <a href="https://pasaniveles.herokuapp.com/" target="_blank" style="text-decoration:underline; color:#dddddd"><span class="highlight" id="0.36861047654943846" name="searchHitInReadingPane">Pasa Niveles</span>.com</a> </div></td></tr></tbody></table></td></tr></tbody></table><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"></table> <div style="display: none;"></div> </div> </div></div> <div style="display: none;"></div> </div></body>';
			 	moduloEmail.enviarEmail(usu.email, cadena);
			 	response.send({email:email});
			 });
		 }else{
		 	response.send({email:undefined})
		 }
	 });

	 /*limboCol.find({email:email}).toArray(function(error,usr){
		 if (usr.length==0){
			 usu=new modelo.Usuario(email, cf.encrypt(request.body.password));
			 persistencia.insertarUsuario(limboCol,usu,function(usu){
			 	var cadena= '<body><div autoid="_rp_D" class="_rp_i5">  <div class="itemPartBody _rp_k5 ms-font-weight-regular ms-font-color-neutralDark" style="display: none;"></div>  <div autoid="_rp_E" class="_rp_j5" style="display: none;"></div>  <div><div autoid="_rp_F" class="_rp_j5 rpHighlightAllClass rpHighlightBodyClass allowTextSelection" role="region" aria-label="Cuerpo del mensaje">   <div style="display: none;"></div> <div style="display: none;"></div>  <div>  <div class="_rp_k5 ms-font-weight-regular ms-font-color-neutralDark" role="presentation" tabindex="-1"><div class="rps_7970"><div><div><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td align="center" style="color:#696969; font:10px Arial">&nbsp;</td></tr></tbody></table><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#2d69b8"><tbody><tr><td style="padding:0 0 40px"><table width="684" border="0" cellspacing="0" cellpadding="0" bgcolor="#2d69b8" align="center"><tbody><tr<td rowspan="2" width="405" height="137"><a href="https://pasaniveles.herokuapp.com/" target="_blank"><h1 width="405" height="137" border="0" style="color:#FFF; font:bold 25px Arial; display:block"></a> </td><td colspan="7" height="102">&nbsp;</td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/mundijuegos/background.png" colspan="8"><table width="684" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td width="42">&nbsp;</td><td width="600" bgcolor="#f5f5f5" style="padding-top:19px"><div style="color:#1a52b8; font:bold 24px ,Arial; line-height:30px; padding-left:50px; padding-right:50px; padding-bottom:19px">Bienvenido a <span class="highlight" id="0.26437121236652006" name="searchHitInReadingPane">Pasa Niveles</span></div><table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFFFFF"><tbody><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_up.png" height="16" colspan="3"></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_bg.png" style="padding-left:65px; padding-right:65px; padding-top:15px; padding-bottom:15px; color:#4f4f4f; font:12px Arial"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td><b style="font-size:14px">Hola '+usu.nombre+'</b><br><br>¡Felicidades! ¡Ya eres un jugador registrado! Para finalizar tu registro y empezar a jugar pulsa el siguiente botón:<br><br><table background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/button-green.png" width="233" align="center" height="72" border="0" cellspacing="0" cellpadding="0" bgcolor="#7bc71e"><tbody><tr><td align="center" valign="middle"><a href= "'+url+'confirmarUsuario/'+usu.email+'/'+usu.key+'" target="_blank" style="color:#FFF; font:bold 18px Tahoma,Arial; line-height:60px; text-decoration:none; display:block; width:233px; line-height:24px">Jugar ahora</a> </td></tr></tbody></table><br><br>Esperamos que disfrutes del juego.<br>El equipo de <b><span class="highlight" id="0.5966038671217082" name="searchHitInReadingPane">Pasa Niveles</span></b></td><td width="136" align="right" valign="top"><img src="http://d4tkw3ysp08j4.cloudfront.net/newavatarv3/maxi/03841302c08000500000000000000003e0000000000ca8410800000044a48a88888890.jpg?updated=1483471434" width="136" height="153" alt="Tu avatar" style="font-size:10px"> </td></tr></tbody></table></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/balloon_down.png" height="21" colspan="3"></td></tr></tbody></table><br><br></td><td width="42">&nbsp;</td></tr></tbody></table></td></tr><tr><td background="http://d3mapax0c3izpi.cloudfront.net/gfx/news/template2/mundijuegos/footer.png" colspan="8" valign="middle" height="124" style="padding-left:60px; padding-right:60px; text-align:left; color:#d1d1d1; font:11px Arial"><div style="padding-bottom:12px">No respondas ni reenvies este email, puede contener información confidencial sobre tu cuenta.<br>Servicio ofrecido por <a href="https://pasaniveles.herokuapp.com/" target="_blank" style="text-decoration:underline; color:#dddddd"><span class="highlight" id="0.36861047654943846" name="searchHitInReadingPane">Pasa Niveles</span>.com</a> </div></td></tr></tbody></table></td></tr></tbody></table><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"></table> <div style="display: none;"></div> </div> </div></div> <div style="display: none;"></div> </div></body>';
			 	moduloEmail.enviarEmail(usu.email, cadena);
			 	response.send({email:email});
			 });
		 }
		 else{
		 	response.send({email:undefined})
		 }
	 });*/
});

app.put("/actualizarUsuario",function(request,response){

	 var uid=request.body.uid;

	 var json={'email':undefined};
	 var usu=juego.obtenerUsuario(uid);
	 
	 	if (usu!=undefined){
		 	 console.log(request.body);
			 var usuario=comprobarCambios(request.body,usu);
			 persistencia.actualizarColeccion(usuariosCol, uid, usuario, function(result){

			   if (result.result.nModified==0){
			     console.log("No se pudo actualizar");
			     response.send(json);
			   }
			   else{ 
			   	 persistencia.encontrarColeccionId(usuariosCol, uid, function(usr){
					if (usr.length!=0){
		           		json=usr[0];
		         	} 
		         	console.log("Usuario modificado");
		     		response.send(json);
				 });
			   }
			 }); 
		} else{
			response.send(json);
		}
		/*if (usu!=undefined){
	 	 console.log(request.body);
		 var usuario=comprobarCambios(request.body,usu);
		 usuariosCol.update({_id:ObjectID(uid)},usuario,function(err,result){

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
		} else{
			response.send(json);
		}*/
});

app.delete("/eliminarUsuario/:uid",function(request,response){
 var uid=request.params.uid;
 var json={'resultados':-1};
 
 if(ObjectID.isValid(uid)){
	 persistencia.eliminarObjeto(usuariosCol, uid, function(result){
		  if (result.result.n==0){
		    console.log("No se pudo eliminar");
		  }else{
		    json={"resultados":1};
		    console.log("Usuario eliminado");
		  }
		  persistencia.eliminarObjeto(limboCol, uid, function(result){
			  if (result.result.n==0){
			    console.log("No se pudo eliminar");
			  }else{
			   json={"resultados":1};
			   console.log("Usuario eliminado");
			  }
		  	  response.send(json);
		  });

	 });
	 /*usuariosCol.remove({_id:ObjectID(uid)},function(err,result){

	  if (result.result.n==0){
	    console.log("No se pudo eliminar");
	  }
	  else{
	   json={"resultados":1};
	   console.log("Usuario eliminado");
	  }
	  
	  limboCol.remove({_id:ObjectID(uid)},function(err,result){

	  if (result.result.n==0){
	    console.log("No se pudo eliminar");
	  }
	  else{
	   json={"resultados":1};
	   console.log("Usuario eliminado");
	  }
	  response.send(json);
	  });

	 });*/
  }else{
  	response.send(json);
  }
});

/*
function modificarEnLimbo(uid){
	
	limboCol.findAndModify({_id:ObjectID(uid)},{},{$set:{key:""}},{},function(err,usr){
		 //console.log(usr);
		 if (err){
			 console.log("No se pudo actualizar");
		 }
		 else{
		 	console.log("Usuario del limbo acualizado");
		 }
	});
}*/

/*function insertarUsuario(usu,response){
	 usuariosCol.insert(usu,function(err){
		 if(err){
		 	console.log("error");
		 }
		 else{
			 console.log("Nuevo usuario creado");
			 juego.agregarUsuario(usu);
			 response.redirect("/");
		 }
	 });
	 
};*/

function comprobarCambios(body,usu){
 if (body.email!=usu.email && body.email!=""){
   usu.email=body.email;
 }

 console.log('password:   '+body.newpass);
 if (body.newpass!=undefined && body.newpass!="" && cf.encrypt(body.newpass)!=usu.password){
   console.log(cf.encrypt(body.newpass));
   usu.password=cf.encrypt(body.newpass);
 }
   if (body.nombre!=usu.nombre && body.nombre!=""){
   usu.nombre=body.nombre;
 }
 return usu;
}
/*
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

}*/

/*function agregarResultado(res){
	console.log(res);
	resultadosCol.find({email:res.email, nivel:res.nivel}).toArray(function(error, usr){
		if(usr.length==0){
			resultadosCol.insert(res,function(err){
				if(err){
					console.log("error");
				}else{
					console.log("nuevo resultado creado")
				}
			});
		}else{
			resultadosCol.update({email:res.email, nivel:res.nivel},res,function(error, result){
				if(result.result.nModified==0){
					console.log("error");
				}else{
					console.log("nuevo resultado creado");	
				}
			});
		}
	})

}*/

//////////////////////////////////////////////////
////EJECUCIÓN DE INICIO Y CONEXIÓN CON LA BBDD////
//////////////////////////////////////////////////
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


mongo.connect("mongodb://mario:mario@ds061354.mlab.com:61354/usuarioscn", function(err, db) {
	
	if (err){
		console.log("No pudo conectar a la base de datos")
	}
	else{
		console.log("Conectado a Mongo: usuarioscn");
		db.collection("usuarios",function(err,col){
			console.log("Tenemos la colección: Usuarios");
			usuariosCol=col;
		});

		db.collection("resultados",function(err,col){
		 	if(err){
			 	console.log("No se puede obtener la colección de resultados");
			 }
			 else{
				 console.log("Tenemos la colección: Resultados");
				 resultadosCol=col;
			 }
	 	});

	 	db.collection("limbo",function(err,col){
		 	if(err){
			 	console.log("No se puede obtener la colección de limbo");
			 }
			 else{
				 console.log("Tenemos la colección: Limbo");
				 limboCol=col;
			 }
	 	});
	}
});
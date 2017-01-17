
var ObjectID=require("mongodb").ObjectID;

module.exports.insertarUsuario= function (coleccion,objeto,callback){
 //var usuariosCol = db.collection("usuarios");
	 //console.log(objeto);
	 coleccion.insert(objeto,function(err){
		 if(err){
		 	console.log("error");
		 	//callback(undefined);
		 }
		 else{
			 console.log("Nuevo usuario creado");
			 callback(objeto);
			/*response.send({email:'ok'})
			 moduloEmail.enviarEmail(objeto.email,objeto.key);*/
		 }
	});
};


module.exports.modificarColeccion= function (coleccion, usr){
	
	coleccion.findAndModify({_id:ObjectID(usr._id)},{},usr,{},function(err){
		 //console.log(usr);
		 if (err){
			 console.log("No se pudo actualizar");
		 }
		 else{
		 	console.log("Usuario del limbo acualizado");
		 }
	});
}

module.exports.agregarResultado= function (res,coleccion, usr){
	
	coleccion.find({email:res.email, nivel:res.nivel}).toArray(function(error, usr){
		if(usr.length==0){
			coleccion.insert(res,function(err){
				if(err){
					console.log("error");
				}else{
					console.log("nuevo resultado creado")
				}
			});
		}else{
			coleccion.update({email:res.email, nivel:res.nivel},res,function(error, result){
				if(result.result.nModified==0){
					console.log("error");
				}else{
					console.log("nuevo resultado creado");	
				}
			});
		}
	});
}

module.exports.actualizarColeccion= function (coleccion, uid, objeto,callback){
 //var usuariosCol = db.collection("usuarios");
	 //console.log(objeto);
	 coleccion.update({_id:ObjectID(uid)},objeto,function(err,result){
	    if (err){
	    	console.log("error");
	    }else{ 
	    	console.log("Usuario Actualizado");
	    	callback(result);
	    }
	 });
};

module.exports.encontrarColeccionId= function (coleccion, uid, callback){
 //var usuariosCol = db.collection("usuarios");
	 //console.log(objeto);
	 coleccion.find({_id:ObjectID(uid)}).toArray(function(err,result){
	    if (err){
	    	console.log("error");
	    }else{ 
	    	console.log("Usuario Encontrado");
	    	callback(result);
	    }
	 });
};

module.exports.encontrarColeccionEmail= function (coleccion, id, callback){
 //var usuariosCol = db.collection("usuarios");
	 //console.log(objeto);
	 coleccion.find({email:id}).toArray(function(err,result){
	    if (err){
	    	console.log("error");
	    }else{ 
	    	console.log("Usuario Encontrado");
	    	callback(result);
	    }
	 });
};

module.exports.encontrarColeccion= function (coleccion, callback){
 //var usuariosCol = db.collection("usuarios");
	 //console.log(objeto);

	 coleccion.find().toArray(function(err,result){
	    if (err){
	    	console.log("error");
	    }else{ 
	    	console.log("Usuario Encontrado");
	    	//console.log(result);
	    	callback(result);
	    }
	 });
};

module.exports.encontrarColeccionIdKey= function (coleccion,email, key, callback){
 //var usuariosCol = db.collection("usuarios");
	 //console.log(objeto);

	 coleccion.find({email:email,key:key}).toArray(function(err,result){
	    if (err){
	    	console.log("error");
	    }else{ 
	    	console.log("Usuario Encontrado");
	    	//console.log(result);
	    	callback(result);
	    }
	 });
};

module.exports.encontrarColeccionIdPassword= function (coleccion,email, password, callback){
 //var usuariosCol = db.collection("usuarios");
	 //console.log(objeto);

	 coleccion.find({email:email,password:password}).toArray(function(err,result){
	    if (err){
	    	console.log("error");
	    }else{ 
	    	console.log("Usuario Encontrado");
	    	//console.log(result);
	    	callback(result);
	    }
	 });
};
module.exports.eliminarObjeto= function (coleccion, uid, callback){
 //var usuariosCol = db.collection("usuarios");
	 //console.log(objeto);

	 coleccion.remove({_id:ObjectID(uid)},function(err,result){
	    if (err){
	    	console.log("error");
	    }else{ 
	    	console.log("Objeto Encontrado");
	    	//console.log(result);
	    	callback(result);
	    }
	 });
};


var ObjectID=require("mongodb").ObjectID;

module.exports.insertarUsuario= function (coleccion,objeto,callback){
 //var usuariosCol = db.collection("usuarios");
	 console.log(objeto);
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

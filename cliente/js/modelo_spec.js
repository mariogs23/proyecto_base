describe("El juego niveles inicialmente...", function(){
	var juego;

	beforeEach(function(){
		juego=new Juego();
	});

	it("una colección de niveles y usuarios vacía", function(){
		expect(juego.niveles.length).toEqual(0);
		expect(juego.usuarios.length).toEqual(0);
	});

	it("agregar usuario", function(){
		var usuario=new Usuario("Pepe");
		juego.agregarUsuario(usuario);

		expect(juego.usuarios[0]).toEqual(usuario);
		expect(juego.usuarios[0].nombre).toEqual("Pepe");
	});
})
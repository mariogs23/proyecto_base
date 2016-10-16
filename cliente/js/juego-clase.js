 function crearNivel(nivel)
 {

    if(nivel>2){
        noHayNiveles();
    }else{
        game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create, update: update });

        function preload() {

            game.load.image('sky', 'assets/sky.png');
            game.load.image('ground', 'assets/platform.png');
            game.load.image('ground2', 'assets/platform2.png');
            game.load.image('meteorito', 'assets/meteorito.png');
            game.load.image('cielo', 'assets/heaven.png');

            game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

        }

        var player;
        var platforms;
        var cursors;
        var cielo;

        var meteoritos;
        var vidas = 5;

        var vidasText;
        var secondText;
        var finText;
        var style={font:"30px Arial",fill:"#ffffff",align:"right"};

        var game;
        var gameFinish= false;
        var timer;
        var segundos=0;

        /*function crearNivel(nivel){
        
            switch(nivel) {
            case '0':
                game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create0, update: update });
                break;
            case '1':
                game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create1, update: update });
                break;
            case '2':
                game = new Phaser.Game(800, 600, Phaser.AUTO, 'juegoId', { preload: preload, create: create2, update: update });
                break;
            default: noHayNiveles();
                break;
        }*/

        function create() {
            iniCoordenadas();

            timer=game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);
            //  We're going to be using physics, so enable the Arcade Physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);

            //  A simple background for our game
            game.add.sprite(0, 0, 'sky');

            //  The platforms group contains the ground and the 2 ledges we can jump on
            platforms = game.add.group();
            cielo = game.add.group();
            //  We will enable physics for any object that is created in this group
            platforms.enableBody = true;
            cielo.enableBody = true;

            var fin=cielo.create(0,0,'cielo');
            fin.scale.setTo(2,0.1);

            // Here we create the ground.
            var ground = platforms.create(0, game.world.height - 64, 'ground');

            //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
            ground.scale.setTo(2, 2);

            //  This stops it from falling away when you jump on it
            ground.body.immovable = true;

            //  Now let's create two ledges
            var ledge = platforms.create(coord[nivel][0].x, coord[nivel][0].y, 'ground2');
            ledge.body.immovable = true;

            ledge = platforms.create(coord[nivel][1].x, coord[nivel][1].y, 'ground2');
            ledge.body.immovable = true;

            ledge = platforms.create(coord[nivel][2].x, coord[nivel][2].y, 'ground2');
            ledge.body.immovable = true;

            ledge = platforms.create(coord[nivel][3].x, coord[nivel][3].y, 'ground2');
            ledge.body.immovable = true;


            // The player and its settings
            player = game.add.sprite(32, game.world.height - 150, 'dude');

            //  We need to enable physics on the player
            game.physics.arcade.enable(player);

            //  Player physics properties. Give the little guy a slight bounce.
            player.body.bounce.y = 0.2;
            player.body.gravity.y = 400;
            player.body.collideWorldBounds = true;

            //  Our two animations, walking left and right.
            player.animations.add('left', [0, 1, 2, 3], 10, true);
            player.animations.add('right', [5, 6, 7, 8], 10, true);

            //  Finally some meteoritos to collect
            meteoritos = game.add.group();

            //  We will enable physics for any meteorito that is created in this group
            meteoritos.enableBody = true;

            //  Here we'll create 12 of them evenly spaced apart
            for (var i = 0; i < 7; i++)
            {
                generateMeteorito();
            }

            //  The vidas
            vidasText = game.add.text(16, 16, 'vidas: ' +vidas, { fontSize: '32px', fill: '#fff' });
            secondText = game.add.text(16, 50, 'tiempo: 0', { fontSize: '32px', fill: '#fff' });
            finText = game.add.text(200,200, '', { fontSize: '60px', fill: "#ffffff", align: "center" });
            //  Our controls.
            cursors = game.input.keyboard.createCursorKeys();
            
        }  

        

        function update() {

            

            //  Collide the player and the meteoritos with the platforms
            game.physics.arcade.collide(player, platforms);
            
            //game.physics.arcade.collide(meteoritos, platforms);
            
            //  Checks to see if the player overlaps with any of the meteoritos, if he does call the collectmeteorito function
            game.physics.arcade.overlap(player, meteoritos, collectMeteorito, null, this);

            game.physics.arcade.overlap(player, cielo, terminaNivel, null, this);

            game.physics.arcade.overlap(platforms, meteoritos, finEstrella, null, this);
            //  Reset the players velocity (movement)
            player.body.velocity.x = 0;

        
            if (cursors.left.isDown)
            {
                //  Move to the left
                player.body.velocity.x = -150;

                player.animations.play('left');
            }
            else if (cursors.right.isDown)
            {
                //  Move to the right
                player.body.velocity.x = 150;

                player.animations.play('right');
            }
            else
            {
                //  Stand still
                player.animations.stop();

                player.frame = 4;
            }
            
            //  Allow the player to jump if they are touching the ground.
            if (cursors.up.isDown && player.body.touching.down)
            {
                player.body.velocity.y = -350;
            }

        }

         function generateMeteorito () {
        
            //  Create a meteorito inside of the 'meteoritos' group
                var meteorito = meteoritos.create((Math.random() * 11) * 70, 0, 'meteorito');

                //  Let gravity do its thing
                meteorito.body.gravity.y = 100;

                //  This just gives each meteorito a slightly random bounce value
                //meteorito.body.bounce.y = 0.7 + Math.random() * 0.2;

        }

        function collectMeteorito (player, meteorito) {
        
            // Removes the meteorito from the screen
            meteorito.kill();

            generateMeteorito();

            //  Add and update the vidas
            vidas = vidas-1;
            vidasText.text = 'vidas: ' + vidas;

            if(vidas<=0){
                vidasText.text ='';
                finText.text = '¡¡Has muerto!!';
                player.kill();
                terminarMeteoritos();
                game.time.events.remove(timer);
            }

        }

        function terminaNivel (player, final) {
            
            //Llamar a nivel completado con el tiempo y las vidas 
            //Matar al jugador
            console.log('Conseguiste completar el nivel');
            finText.text = '¡¡Nivel Completado!!';
            mostrarDatos(segundos, player.vidas);
            player.kill();
            terminarMeteoritos();
            game.time.events.remove(timer);
            segundos=0;
            game.destroy();
        }

        function terminarMeteoritos(){
            meteoritos.forEach(function(c) {c.kill(); });
        }

        function finEstrella (platforms, meteorito) {
            
            meteorito.kill();
            generateMeteorito();

        }

        function updateCounter() {

            segundos++;
            secondText.setText('tiempo: ' + segundos);

        }
    }
}
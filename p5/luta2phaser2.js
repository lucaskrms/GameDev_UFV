var game = new Phaser.Game(675, 353, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.spritesheet('lutadorA', 'karatea.png', 75, 75);
    game.load.spritesheet('lutadorB', 'karateb.png', 75, 75);
    game.load.image('fundo', 'fundonoite.png');
    game.load.image('plata', 'plataforma.png');
}

var cursors;
var lutA;
var lutB;
var chao = 277;
var cont = 0;
var key1;
var key2;
var acoes = ['chuta', 'mortal', 'soca', 'kika', 'bloqueia', 'bloqueia' ]
var golpes = ['chuta',  'soca', 'voadora' ]
var valorVidaA = 100
var valorVidaB = 100
var vidaA, vidaB;


//**************************************
// IA do lutador automatico            *
//**************************************
function ia_lutB() {

    if (Math.abs(lutB.x-lutA.x)> 150) return

   // Acoes do lutador automatico
    i =Math.floor((Math.random() * 100) );

    if (lutB.animations.currentAnim.name=='morto') {
    	return
    }

    if (i< acoes.length && lutB.animations.currentAnim.name=='kika' ) {
		lutB.play(acoes[i]);
        if (acoes[i]== 'mortal') {
              lutB.body.velocity.x = 100;
        }
        else if (acoes[i]== 'kika') {
              lutB.body.velocity.x = 0;
        }
    }
}

function create() {

    back = game.add.image(0, 0, 'fundo');
    back.smoothed = false;

    vidaA = new Phaser.Rectangle(560, 320, valorVidaA, 10);
    vidaB = new Phaser.Rectangle(20, 320, valorVidaB, 10);

    //*******************
    // Cria a lutador A *
    //*******************
    lutA = game.add.sprite(530, 180, 'lutadorA', 1);
    lutA.smoothed = false;
    
    // Acoes
    //*******************
    animChuta = lutA.animations.add('chuta', [0,1,2,3,4,5,4,3,2,1,0,6], 10, false);
    animMortal = lutA.animations.add('mortal', [40,41,42,43,44,45,46,47,48,49], 5, false);
    animQueda1 = lutA.animations.add('queda1', [20,21,22,23,24,25,26,27,28,29], 5, false);
    animSoca = lutA.animations.add('soca', [17,18,19], 5, false);
    animAnda = lutA.animations.add('anda', [6,7,8,9], 5, false);
    animVoa = lutA.animations.add('voadora', [17,16,15,14,13,12], 5, false);
    animMorto = lutA.animations.add('morto', [24,23], 5, false);
    lutA.animations.add('kika', [8,9], 5, true);

    // Ao final todas as acoes voltam para a acao 'kika'
    //**************************************************
    animChuta.onComplete.add(function() {  lutA.play('kika');  }, lutA);
    animMortal.onComplete.add(function() {  lutA.play('kika');  }, lutA);
    animQueda1.onComplete.add(function() { if (valorVidaA>0) lutA.play('kika'); else lutA.play('morto') ;  }, lutA);
    animSoca.onComplete.add(function() {  lutA.play('kika');  }, lutA);
    animVoa.onComplete.add(function() {  lutA.play('kika');  }, lutA);
    animAnda.onComplete.add(function() {  lutA.play('kika'); lutA.body.velocity.x =  0; }, lutA);

    // Define a fisica
    //**************************************************
    game.physics.enable(lutA, Phaser.Physics.ARCADE);
    lutA.body.setSize(60, 75);    // Isto faz com que um sprite penetre mais no outro, tornado o golpe mais real
    lutA.body.bounce.set(1);
    lutA.body.collideWorldBounds = true;
    lutA.body.bounce.y = 0.8;
    lutA.body.gravity.y = 500;

    //*******************
    // Cria a lutador B *
    //*******************
    lutB = game.add.sprite(230, 180, 'lutadorB', 1);
    lutB.smoothed = false;

    // Acoes
    //*******************
    animChutaB = lutB.animations.add('chuta', [4,5,6,7,8,9,8,7,6,5,4], 10, false);
    animMortalB = lutB.animations.add('mortal', [40,41,42,43,44,45,46,47,48,49], 5, false);
    animQueda1B = lutB.animations.add('queda1', [20,21,22,23,24,25,26,27,28,29], 5, false);
    animSocaB = lutB.animations.add('soca', [10,11,12], 5, false);
    animAndaB = lutB.animations.add('anda', [0,1,2,3], 5, false);
    animBloqueiaB = lutB.animations.add('bloqueia', [0,1,19], 5, false);
    animMorto = lutB.animations.add('morto', [24,23], 5, false);
    lutB.animations.add('kika', [0,1], 5, true);

    // Ao final todas as acoes voltam para a acao 'kika'
    //**************************************************
    animChutaB.onComplete.add(function() {  lutB.play('kika');  }, lutB);
    animMortalB.onComplete.add(function() {  lutB.play('kika');  }, lutB);
    animQueda1B.onComplete.add(function() { if (valorVidaB>0)  lutB.play('kika'); else lutB.play('morto');  }, lutB);
    animSocaB.onComplete.add(function() {  lutB.play('kika');  }, lutB);
    animBloqueiaB.onComplete.add(function() {  lutB.play('kika');  }, lutB);
    animAndaB.onComplete.add(function() {  lutB.play('kika'); lutB.body.velocity.x =  0; }, lutB);

    // Define a fisica
    //**************************************************
    game.physics.enable(lutB, Phaser.Physics.ARCADE);
    lutB.body.setSize(60, 75); // Isto faz com que um sprite penetre mais no outro, tornado o golpe mais real
    lutB.body.bounce.set(1);
    lutB.body.collideWorldBounds = true;
    lutB.body.bounce.y = 0.8;
    lutB.body.gravity.y = 500;

 
    // Define o chao
    //**************************************************
    plataformas = game.add.physicsGroup();
    plataformas.create(18, chao, 'plata');
    plataformas.setAll('body.immovable', true);

    // Define as teclas
    //**************************************************
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    key2 = game.input.keyboard.addKey(Phaser.Keyboard.TWO);

    lutA.play('kika');
    lutB.play('kika');

    var style = { font: "16px Courier", fill: "#fff", tabs: [ 164, 120, 80 ] };

}

//*****************************
//  Decide acoes do jogador A *
//*****************************
function acoesA() {

   if (lutA.animations.currentAnim.name=='morto') {
    	return
    }


    if (upKey.isDown)
    {
       lutA.play('chuta');
       lutA.body.velocity.x =  0;
    }
    else if (downKey.isDown)
    {
        lutA.body.velocity.x =  0;
        lutA.play('soca');
    }
    else if (leftKey.isDown)
    {

        if (lutA.animations.currentAnim.name!='anda') {lutA.play('anda');}
        lutA.body.velocity.x =  -100;
    }
    else if (rightKey.isDown)
    {
        if (lutA.animations.currentAnim.name!='anda') {lutA.play('anda');}
        lutA.body.velocity.x =  100;
    }
    else if (jumpButton.isDown)
    {
        lutA.body.velocity.y = -200;
       pulando = true;
    }

    else if (key1.isDown)
    {
        if (lutA.animations.currentAnim.name=='kika') {
           lutA.play('mortal'); 
           lutA.body.velocity.x =  100;
        }      
    }

    else if (key2.isDown)
    {
        if (lutA.animations.currentAnim.name=='kika') {
           lutA.play('voadora');
           lutA.body.velocity.y = -200;
           lutA.body.velocity.x =  -100;
        }      
    }
}

//*****************************
//       Game Loop            *
//*****************************
function update() {

    game.physics.arcade.collide(lutA, plataformas);
    game.physics.arcade.collide(lutB, plataformas);

    acoesA() 

    ia_lutB();

    game.physics.arcade.collide(lutA, lutB, collisionHandlerLuta, null, this);

}

//*****************************
//       Trata Colisoes       *
//*****************************
function collisionHandlerLuta(A, B) {
        na = A.animations.currentAnim.name;
        nb = B.animations.currentAnim.name;
        if ((na == 'soca' || na == 'chuta' || na == 'voadora') && (nb == 'kika' || nb == 'anda' )) {
        	B.play('queda1');
        	if (valorVidaB > 0) { 
        		valorVidaB -=20;
                vidaB = new Phaser.Rectangle(20, 320, valorVidaB, 10);
            }    
        }      
        if ((nb == 'soca' || nb == 'chuta')  && (na == 'kika' || na == 'anda' )) {
        	A.play('queda1');
       	if (valorVidaA > 0) { 
        		valorVidaA -=20;
                vidaA = new Phaser.Rectangle(560, 320, valorVidaA, 10);
            }    
        }      
}


function render() {
 // game.debug.inputInfo(32, 32);
 //game.debug.text(lutA.animations.currentAnim.name, 32, 230);
  game.debug.geom(vidaA,'#0fffff');
  game.debug.geom(vidaB,'#ddd256');
 game.debug.text('vidaA:'+valorVidaA, 32, 64);
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.width = 200;
ctx.height=300;

var nome=navigator.userAgent; 
var direita=39;
var esquerda=37;

if (nome.indexOf('Chrome')!=-1) {
    direita=100;
    esquerda=97;
}

var fundo = new function(){
    this.img = new Image();
    this.img.src = 'nuvem.png';  
    this.iniframe =0;
    this.w =216;
    this.h =480;
    this.length=10;
}

function limpa(){
    ctx.fillStyle = '#d0e7f9';  
    ctx.rect(0, 0,  ctx.width,  ctx.height);    
    ctx.fill();  
}

function desenha(){
    desenhaFundo();
}

function desenhaFundo(){
    for (let i = 0; i < fundo.length; i++) {
       posicaoOrigemX= fundo.w*((fundo.iniframe+i)% fundo.length);
       x = fundo.w*i;
       ctx.drawImage(fundo.img,posicaoOrigemX,0,fundo.w, fundo.h,x,0,fundo.w, fundo.h);  
    }
    fundo.iniframe = (fundo.iniframe+1)% fundo.length;
}

var GameLoop = function(){
    desenha();
    setTimeout(GameLoop, 200);
}

GameLoop();

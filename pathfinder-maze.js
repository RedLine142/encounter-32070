(()=>{

const CONFIG={
width:520,
height:620,
roadWidth:220,
laps:3,
maxSpeed:9
};

let initialized=false;
let canvas,ctx;

let running=false;
let finished=false;
let animationId=null;

let player={
x:0,
y:0,
width:28,
height:48,
speed:0
};

let roadOffset=0;
let distance=0;
let lap=1;
let score=0;

let opponents=[];
let keys={
left:false,
right:false
};

function init(){

```
const race=document.getElementById("pp-race");
canvas=document.getElementById("pp-race-canvas");

if(!race || !canvas) return false;

if(initialized) return true;

initialized=true;

canvas.width=CONFIG.width;
canvas.height=CONFIG.height;

ctx=canvas.getContext("2d");

ctx.imageSmoothingEnabled=false;

const startBtn=document.getElementById("pp-start");
const resetBtn=document.getElementById("pp-reset");

const leftBtn=document.getElementById("pp-left");
const rightBtn=document.getElementById("pp-right");

const speedEl=document.getElementById("pp-speed");
const lapEl=document.getElementById("pp-lap");
const scoreEl=document.getElementById("pp-score");
const stepsEl=document.getElementById("pp-steps");

const success=document.getElementById("pp-success");
const successTitle=document.getElementById("pp-success-title");
const successText=document.getElementById("pp-success-text");


function resizeCanvas(){

    const box=race.clientWidth;

    if(box>0){
        canvas.style.width="100%";
        canvas.style.height=(box*CONFIG.height/CONFIG.width)+"px";
    }
}


function resetGame(){

    running=false;
    finished=false;

    if(animationId){
        cancelAnimationFrame(animationId);
        animationId=null;
    }

    player.x=CONFIG.width/2;
    player.y=CONFIG.height-105;
    player.speed=0;

    roadOffset=0;
    distance=0;
    lap=1;
    score=0;

    opponents=[
        createOpponent(-80,-0.2),
        createOpponent(-250,0.25),
        createOpponent(-430,-0.25),
        createOpponent(-620,0.15)
    ];

    success.style.display="none";

    startBtn.textContent="▶  Старт";
    startBtn.style.background="#3de96f";
    startBtn.style.color="#03100b";

    stepsEl.textContent="Нажми «Старт», чтобы начать гонку";

    updateStats();

    draw();
}


function createOpponent(y,side){

    return{
        x:CONFIG.width/2 + side*55,
        y:y,
        width:28,
        height:48,
        speed:3.2+Math.random()*1.8,
        color:Math.random()>0.5 ? "#e34b4b":"#e8b43c"
    };

}


function updateStats(){

    speedEl.textContent=Math.round(player.speed*22);

    lapEl.textContent=Math.min(lap,CONFIG.laps)+"/"+CONFIG.laps;

    scoreEl.textContent=Math.max(0,Math.floor(score));

}


function roadCenter(y){

    /*
     * Синусоидальная трасса.
     * Благодаря этому дорога постоянно немного
     * изгибается, создавая ощущение движения.
     */

    const curve=
        Math.sin((y+roadOffset)*0.010)*58+
        Math.sin((y+roadOffset)*0.0045)*32;

    return CONFIG.width/2+curve;

}


function roadEdges(y){

    const center=roadCenter(y);

    return{
        left:center-CONFIG.roadWidth/2,
        right:center+CONFIG.roadWidth/2
    };

}


function drawBackground(){

    /*
     * Небо
     */

    ctx.fillStyle="#07120f";
    ctx.fillRect(0,0,CONFIG.width,CONFIG.height);

    /*
     * Горизонт
     */

    ctx.fillStyle="#0d251d";
    ctx.fillRect(0,0,CONFIG.width,145);

    /*
     * Pixel-art деревья
     */

    for(let i=0;i<12;i++){

        const x=(i*83+27)%CONFIG.width;

        const y=95+(i%3)*24;

        ctx.fillStyle="#071b15";
        ctx.fillRect(x,y,14,55);

        ctx.fillStyle="#123c2c";
        ctx.fillRect(x-18,y-22,50,30);

        ctx.fillRect(x-10,y-38,34,22);

    }

    /*
     * Трава
     */

    ctx.fillStyle="#0b281c";
    ctx.fillRect(0,145,CONFIG.width,CONFIG.height-145);

}


function drawRoad(){

    /*
     * Рисуем дорогу горизонтальными полосами.
     * Это даёт старый аркадный эффект перспективы.
     */

    for(let y=145;y<CONFIG.height;y+=4){

        const edge=roadEdges(y);

        /*
         * Обочина
         */

        ctx.fillStyle=
            Math.floor((y+roadOffset)/24)%2===0
            ? "#d9d0a0"
            : "#c94942";

        ctx.fillRect(
            edge.left-8,
            y,
            8,
            4
        );

        ctx.fillRect(
            edge.right,
            y,
            8,
            4
        );

        /*
         * Асфальт
         */

        ctx.fillStyle="#252b29";

        ctx.fillRect(
            edge.left,
            y,
            CONFIG.roadWidth,
            4
        );

    }


    /*
     * Центральная разметка
     */

    for(let y=150;y<CONFIG.height;y+=48){

        const edge=roadEdges(y);

        const center=(edge.left+edge.right)/2;

        ctx.fillStyle="#eee8bd";

        ctx.fillRect(
            center-3,
            y,
            6,
            22
        );

    }

}


function drawCar(car,color){

    const x=Math.round(car.x-car.width/2);
    const y=Math.round(car.y-car.height/2);

    /*
     * Тень
     */

    ctx.fillStyle="rgba(0,0,0,.45)";
    ctx.fillRect(
        x+4,
        y+5,
        car.width,
        car.height
    );

    /*
     * Основной корпус
     */

    ctx.fillStyle=color;
    ctx.fillRect(
        x,
        y+9,
        car.width,
        car.height-13
    );

    /*
     * Крыша
     */

    ctx.fillStyle=color;

    ctx.fillRect(
        x+5,
        y,
        car.width-10,
        22
    );

    /*
     * Стёкла
     */

    ctx.fillStyle="#102426";

    ctx.fillRect(
        x+8,
        y+4,
        car.width-16,
        9
    );

    ctx.fillRect(
        x+8,
        y+17,
        car.width-16,
        5
    );

    /*
     * Фары
     */

    ctx.fillStyle="#f7efb1";

    ctx.fillRect(
        x+3,
        y+3,
        5,
        5
    );

    ctx.fillRect(
        x+car.width-8,
        y+3,
        5,
        5
    );

    /*
     * Задние фонари
     */

    ctx.fillStyle="#ff4b4b";

    ctx.fillRect(
        x+3,
        y+car.height-8,
        5,
        5
    );

    ctx.fillRect(
        x+car.width-8,
        y+car.height-8,
        5,
        5
    );

    /*
     * Колёса
     */

    ctx.fillStyle="#050707";

    ctx.fillRect(
        x-4,
        y+11,
        5,
        13
    );

    ctx.fillRect(
        x+car.width-1,
        y+11,
        5,
        13
    );

    ctx.fillRect(
        x-4,
        y+car.height-20,
        5,
        13
    );

    ctx.fillRect(
        x+car.width-1,
        y+car.height-20,
        5,
        13
    );

}


function drawHUD(){

    /*
     * Верхняя панель
     */

    ctx.fillStyle="rgba(2,9,8,.82)";
    ctx.fillRect(10,10,CONFIG.width-20,42);

    ctx.strokeStyle="#2e685a";
    ctx.strokeRect(10,10,CONFIG.width-20,42);

    ctx.font="bold 14px monospace";
    ctx.fillStyle="#63f0b0";

    ctx.fillText(
        "8-BIT RACE",
        20,
        36
    );

    ctx.fillStyle="#d7e8e1";

    ctx.fillText(
        "LAP "+Math.min(lap,CONFIG.laps)+"/"+CONFIG.laps,
        190,
        36
    );

    ctx.fillText(
        Math.round(player.speed*22)+" KM/H",
        315,
        36
    );

}


function drawStartLine(){

    if(distance>70) return;

    const y=160;

    const edge=roadEdges(y);

    const square=12;

    for(let row=0;row<2;row++){

        for(
            let x=edge.left;
            x<edge.right;
            x+=square
        ){

            ctx.fillStyle=
                ((x-edge.left)/square+row)%2===0
                ? "#f3eee0"
                : "#151918";

            ctx.fillRect(
                x,
                y+row*square,
                square,
                square
            );

        }

    }

}


function draw(){

    if(!ctx) return;

    drawBackground();
    drawRoad();
    drawStartLine();

    /*
     * Соперники
     */

    opponents.forEach(car=>{

        if(
            car.y>-80 &&
            car.y<CONFIG.height+80
        ){

            drawCar(
                car,
                car.color
            );

        }

    });


    /*
     * Машина игрока
     */

    drawCar(
        player,
        "#36e985"
    );

    drawHUD();

}


function collision(a,b){

    return(
        Math.abs(a.x-b.x)<28 &&
        Math.abs(a.y-b.y)<43
    );

}


function update(){

    if(!running) return;


    /*
     * Плавный набор скорости
     */

    player.speed+=0.035;

    if(player.speed>CONFIG.maxSpeed){
        player.speed=CONFIG.maxSpeed;
    }


    /*
     * Управление
     */

    if(keys.left){
        player.x-=3.8;
    }

    if(keys.right){
        player.x+=3.8;
    }


    /*
     * Центр трассы под машиной
     */

    const road=roadEdges(player.y);

    /*
     * Выезд за пределы трассы
     */

    if(
        player.x<road.left+17 ||
        player.x>road.right-17
    ){

        player.speed-=0.13;

        if(player.speed<2){
            player.speed=2;
        }

        score-=0.35;

    }


    /*
     * Машина не может уехать за экран
     */

    player.x=Math.max(
        18,
        Math.min(
            CONFIG.width-18,
            player.x
        )
    );


    /*
     * Движение трассы
     */

    roadOffset+=player.speed;

    distance+=player.speed;


    /*
     * Новый круг
     */

    if(distance>=1500){

        distance=0;
        lap++;

        score+=500;

        if(lap>CONFIG.laps){

            finishRace();
            return;

        }

    }


    /*
     * Соперники движутся вниз относительно игрока.
     */

    opponents.forEach(car=>{

        car.y+=
            player.speed-car.speed;

        /*
         * Машина ушла вниз —
         * появляется снова сверху.
         */

        if(car.y>CONFIG.height+80){

            car.y=-80-Math.random()*180;

            const e=roadEdges(120);

            car.x=
                e.left+25+
                Math.random()*
                (CONFIG.roadWidth-50);

            car.speed=
                3.2+Math.random()*2;

            score+=100;

        }


        /*
         * Если столкнулись
         */

        if(collision(player,car)){

            player.speed-=1.8;

            score-=75;

            car.y-=55;

            /*
             * Небольшой эффект отскока
             */

            if(keys.left){
                player.x+=18;
            }else if(keys.right){
                player.x-=18;
            }

        }

    });


    score+=player.speed*0.035;

    updateStats();

    draw();

    animationId=requestAnimationFrame(update);

}


function start(){

    if(running) return;

    if(finished){
        resetGame();
    }

    running=true;
    finished=false;

    success.style.display="none";

    startBtn.textContent="■  Гонка идёт";
    startBtn.style.background="#2b6e52";
    startBtn.style.color="#d9fff0";

    stepsEl.textContent=
        "Держи машину на трассе и обгоняй соперников!";

    update();

}


function finishRace(){

    running=false;
    finished=true;

    if(animationId){
        cancelAnimationFrame(animationId);
        animationId=null;
    }

    player.speed=0;

    score+=1000;

    updateStats();

    startBtn.textContent="✓  Финиш";
    startBtn.style.background="#163c2b";
    startBtn.style.color="#53f0a5";

    success.style.display="block";

    successTitle.textContent="🏁 ФИНИШ!";

    successText.textContent=
        "Трасса пройдена! Твой результат: "+
        Math.max(0,Math.floor(score))+
        " очков.";

    stepsEl.textContent=
        "Гонка завершена — нажми «Сбросить», чтобы проехать ещё раз.";

    draw();

}


/*
 * Клавиатура
 */

if(!window.__ppRaceKeyboard){

    window.__ppRaceKeyboard=true;

    document.addEventListener(
        "keydown",
        function(e){

            if(
                e.key==="ArrowLeft" ||
                e.key.toLowerCase()==="a"
            ){

                keys.left=true;
                e.preventDefault();

            }

            if(
                e.key==="ArrowRight" ||
                e.key.toLowerCase()==="d"
            ){

                keys.right=true;
                e.preventDefault();

            }

        }
    );


    document.addEventListener(
        "keyup",
        function(e){

            if(
                e.key==="ArrowLeft" ||
                e.key.toLowerCase()==="a"
            ){

                keys.left=false;

            }

            if(
                e.key==="ArrowRight" ||
                e.key.toLowerCase()==="d"
            ){

                keys.right=false;

            }

        }
    );

}


/*
 * Мобильные кнопки
 */

function holdButton(button,direction){

    if(!button) return;

    const down=function(e){

        e.preventDefault();

        keys[direction]=true;

    };

    const up=function(e){

        e.preventDefault();

        keys[direction]=false;

    };

    button.addEventListener("mousedown",down);
    button.addEventListener("mouseup",up);
    button.addEventListener("mouseleave",up);

    button.addEventListener("touchstart",down,{passive:false});
    button.addEventListener("touchend",up,{passive:false});
    button.addEventListener("touchcancel",up,{passive:false});

}

holdButton(leftBtn,"left");
holdButton(rightBtn,"right");


startBtn.addEventListener(
    "click",
    start
);

resetBtn.addEventListener(
    "click",
    resetGame
);


window.addEventListener(
    "resize",
    resizeCanvas
);


resetGame();
resizeCanvas();

return true;
```

}

let attempts=0;

const timer=setInterval(
function(){

```
    if(
        init() ||
        ++attempts>60
    ){

        clearInterval(timer);

    }

},
200
```

);

})();

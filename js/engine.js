//////////////////////////////////////////global variable//////////////////////
const w = document.documentElement.clientWidth,
      h = document.documentElement.clientHeight;

const original = w*0.275,
      ratio = 45,
      scale = original/130,
      positonY=0.489*w,
      bgScaleY=h/750,
      bgScaleX=w/466;
//train's stop locations
const train_loc_1 = {x:h*3/4, b:8000},
      train_loc_2 = {x:10, b:4000},
      train_loc_3 = {x: -0.3*h, b:8000},
      train_loc_4 = {x: -0.9*h-50, b:6000},
      train_loc_5 = {x: -3.5*h, b:8000};


const back_loc_1 = {x:-4*h,b:6000},
      front_loc_1 ={x: -4*h,b: 6000};

//initial image series
const arrTitle2 = pushQuizPieces(14, 'title1'),
    arrTitle3 = pushQuizPieces(14, 'title2'),
    arrTitle4 = pushQuizPieces(10, 'title3'),
    arrTitle5 = pushQuizPieces(12, 'title4');
//recurse the quiz; loop can be used as well.
//Here I chose the readability over the proformance
//Since the array is short.
function pushQuizPieces(count,file_url,num=0,arr=[]){

    if(arr.length == count+1) return arr;

    var image = new createjs.Bitmap("./images/"+file_url+"/"+num+".png");
    arr.push(image);
    const new_num = num+1;

    return pushQuizPieces(count--,file_url,new_num,arr);
}


///////////////////////////////////////Prototype///////////////////////////////

//audio
function Sound (id_str){
    this.id = id_str;
}
Sound.prototype.play = function () {
    console.log("sound play is triggered "+ this.id);
    let audio = document.getElementById(this.id);

    if(audio){
        audio.play().catch(e =>
            console.log("sound play method has something wrong: "+e)
        );
        document.addEventListener("WeixinJSBridgeReady", () => {
            audio.play().catch(e =>
                console.log("sound wechat play method has something wrong: "+e)
            );
        }, false);
    }
};


//scene
function Scene(stage,image){
    this.stage = new createjs.Stage(stage);
    this.background = new createjs.Bitmap(image);
    this.stage.canvas.width=h;
    this.stage.canvas.height=w;
}
Scene.prototype.render = function(){

    this.background.scaleX=bgScaleY;
    this.background.scaleY=bgScaleX;
    this.background.x=-5*h;
    this.background.y=0;

    this.stage.addChild(this.background);
    createjs.Ticker.setFPS(ratio);
    createjs.Ticker.on('tick',this.stage);
};
Scene.prototype.update = function(...args){
    if(args[1]== undefined){
        createjs.Tween.get(this.background, {loop: false})
            .to({x: args[0].x}, args[0].b, createjs.Ease.getPowInOut(4));
    }else{
        createjs.Tween.get(this.background, {loop: false})
            .to({x: args[0].x}, args[0].b, createjs.Ease.getPowInOut(4)).call(args[1]);
    }

};

//train: the son of Scene
function Train(stage, image){
    Scene.call(this,stage,image);
}
Train.prototype = Object.create(Scene.prototype);
Train.prototype.render = function(){
    let railway = new createjs.Bitmap("./images/railway.png");

    this.background.scaleX=scale;
    this.background.scaleY=scale;
    railway.scaleY=scale;

//设置在舞台中的位置
    this.background.x=1000;
    this.background.y=positonY;
    railway.y=positonY;
// 把动画放到舞台上，创建一个间隔事件侦听，进行动画

    this.stage.addChild(railway);
    this.stage.addChild(this.background);

    createjs.Ticker.setFPS(ratio);
    createjs.Ticker.on('tick',this.stage);
};


//animation of the background
function SheetAnim (id,url){
    this.url = url;
    this.canvas = document.getElementById(id);
    this.stage = new createjs.Stage(this.canvas);
    this.container = new createjs.Container();
}
SheetAnim.prototype.render = function(){

    this.stage.addChild(this.container);
    this.stage.canvas.height=w;
    this.stage.canvas.width=h;

    let data ={
        framerate:1,
        images:[this.url],
        frames:{
            width:750,
            height:466,
            count:3
        },
        animations:{
            anim : [0,2,'anim']
        }

    };

    let spriteSheet = new createjs.SpriteSheet(data);
    let img = new createjs.Sprite(spriteSheet, 'anim');

    img.set({x:0,y:0,scaleX: h/750,scaleY:w/466 });
    this.container.addChild(img);

    createjs.Ticker.on('tick',this.stage);
};


//the action of the quiz's topic
function Tween(canvas,img_arr){
    this.stage = new createjs.Stage(canvas);
    this.img_arr = img_arr;
}
Tween.prototype.render = function() {
    this.stage.canvas.width=h;
    this.stage.canvas.height=w;

    for(let i=0;i<this.img_arr.length;i++){
        this.img_arr[i].scaleX=scale*1.2;
        this.img_arr[i].scaleY=scale*1.2;

        i==0? this.img_arr[i].visible=true:this.img_arr[i].visible=false;

        this.img_arr[i].x=h;
        this.img_arr[i].y=positonY*0.95;
        this.stage.addChild(this.img_arr[i]);
   }

    createjs.Ticker.setFPS(ratio);
    createjs.Ticker.on('tick',this.stage);

};
//first time 8000, after is 3000
Tween.prototype.Enter = function (b){

    this.img_arr.forEach(e => {
        createjs.Tween.get(e, {loop: false})
            .to({x: h*0.42}, b, createjs.Ease.getPowInOut(4));
    });
}
Tween.prototype.Leave = function(cb){
    let length = this.img_arr.length;
    for(var i=0;i<length-1;i++){
        createjs.Tween.get(this.img_arr[i], {loop: false})
            .to({x: 1.2*h}, 3000, createjs.Ease.getPowInOut(4));
    }

    createjs.Tween.get(this.img_arr[length-1], {loop: false})
        .to({x: 1.2*h}, 3000, createjs.Ease.getPowInOut(4)).call(cb);
};


var  stageTitle1=new createjs.Stage("title1");
var  stageTitle2=new createjs.Stage("title2");
var  stageTitle3=new createjs.Stage("title3");
var  stageTitle4=new createjs.Stage("title4");
//stage和handle函数要注意避免毁掉错误
function title1In() {
    stageTitle1.canvas.width=h;
    stageTitle1.canvas.height=w;

    initTitle(arrTitle2,stageTitle1);
    createjs.Ticker.setFPS(ratio);
    createjs.Ticker.on('tick',stageTitle1);
    TweenIn1Title(arrTitle2);
}

///////////////////////Instantiate Objects/////////////////////////////
var audio_wrong = new Sound('audio_wrong'),
    audio_right = new Sound('audio_right'),
    audio_out = new Sound('audio_out'),
    audio_start = new Sound('audio_start'),
    audio_run = new Sound('audio_running'),
    audio_bg = new Sound('audio_bg'),

    speed_train = new Train('canvas1','./images/train.png'),
    back_scene = new Scene('bg1','./images/page1/bgt1.png'),
    front_scene = new Scene('fbg1','./images/page1/fbgt.png'),

    bubble_anim = new SheetAnim('bubble','./images/page1/bubble.png'),
    snow_anim = new SheetAnim('snow','./images/page2/snow1.png'),

    topic1 = new Tween("title1",arrTitle2),
    topic2 = new Tween("title2",arrTitle3),
    topic3 = new Tween("title3",arrTitle4),
    topic4 = new Tween("title4",arrTitle5);


// var audioArr = [audio_run,audio_start,audio_bg,audio_out,audio_right,audio_run,audio_wrong];


// renderAudios();
////////////////////////Function Utils//////////////////////////////

function preload (handleFileProgress,handleComplete){
    let manifest = [
        {src: 'asset/audio/out.mp3', id: 'sona2'},
        {src: 'asset/audio/right.mp3', id: 'sona3'},
        {src: 'asset/audio/running.mp3', id: 'sona4'},
        {src: 'asset/audio/start.mp3', id: 'sona5'},
        {src: 'asset/audio/wrong.mp3', id: 'sona6'},
        {src: 'asset/audio/bg.mp3', id: 'sona7'},
        {src: 'asset/font/timing-light.TTF', id: 'font1'},
        {src: 'asset/font/writing-light.TTF', id: 'font2'},

        {src: 'images/page1/btn.png', id: 'p12'},
        {src: 'images/page1/bubble.png', id: 'p13'},
        {src: 'images/page1/hint.png', id: 'p15'},
        {src: 'images/page1/title.png', id: 'p16'},
        {src: 'images/page1/fbgt.png', id: 'p18'},
        {src: 'images/page1/bgt1.png', id: 'p19'},

        {src: 'images/page2/snow1.png', id: 'p20'},
        {src: 'images/page2/fa1.png', id: 'p21'},
        {src: 'images/page2/fa2.png', id: 'p22'},
        {src: 'images/page2/fa3.png', id: 'p23'},
        {src: 'images/page2/fa4.png', id: 'p24'},
        {src: 'images/page2/fa5.png', id: 'p25'},
        {src: 'images/page2/fa6.png', id: 'p26'},


        {src: 'images/page3/cloud.png', id: 'p30'},
        {src: 'images/page3/fa1.png', id: 'p31'},
        {src: 'images/page3/fa2.png', id: 'p32'},
        {src: 'images/page3/fa3.png', id: 'p33'},
        {src: 'images/page3/fa4.png', id: 'p34'},
        {src: 'images/page3/fa5.png', id: 'p35'},
        {src: 'images/page3/fa6.png', id: 'p36'},
        {src: 'images/page3/fa7.png', id: 'p37'},
        {src: 'images/page3/signal.png', id: 'p38'},

        {src: 'images/page4/heart.png', id: 'p40'},
        {src: 'images/page4/fa1.png', id: 'p41'},
        {src: 'images/page4/fa2.png', id: 'p42'},
        {src: 'images/page4/fa3.png', id: 'p43'},
        {src: 'images/page4/fa4.png', id: 'p44'},
        {src: 'images/page4/fa5.png', id: 'p45'},
        {src: 'images/page4/fa6.png', id: 'p46'},
        {src: 'images/page4/fa7.png', id: 'p47'},
        {src: 'images/page4/fa8.png', id: 'p48'},

        {src: 'images/page5/flower.png', id: 'p50'},
        {src: 'images/page5/fa1.png', id: 'p51'},
        {src: 'images/page5/fa2.png', id: 'p52'},
        {src: 'images/page5/fa3.png', id: 'p53'},
        {src: 'images/page5/fa4.png', id: 'p54'},
        {src: 'images/page5/fa5.png', id: 'p55'},
        {src: 'images/page5/fa6.png', id: 'p56'},
        {src: 'images/page5/fa7.png', id: 'p57'},
        {src: 'images/page5/money.png', id: 'p58'},

        {src: 'images/page6/flag.png', id: 'p63'},
        {src: 'images/page6/solgan1.png', id: 'p64'},
        {src: 'images/page6/solgan2.png', id: 'p65'},
        {src: 'images/page6/check.png', id: 'p60'},
        {src: 'images/page6/money.png', id: 'p61'},

        {src: 'images/page7/bg.png', id: 'p71'},
        {src: 'images/page7/border1.png', id: 'p72'},
        {src: 'images/page7/share.png', id: 'p73'},
        {src: 'images/page7/btn1.png', id: 'p74'},
        {src: 'images/page7/btn2.png', id: 'p75'},
        {src: 'images/page7/btn3.png', id: 'p76'},

        {src: 'images/railway.png', id: 'p1'},
        {src: 'images/timer.png', id: 'p2'},
        {src: 'images/train.png', id: 'p3'},

        {src: 'images/title1/0.png', id: 't10'},
        {src: 'images/title1/1.png', id: 't11'},
        {src: 'images/title1/2.png', id: 't12'},
        {src: 'images/title1/3.png', id: 't13'},
        {src: 'images/title1/4.png', id: 't14'},
        {src: 'images/title1/5.png', id: 't15'},
        {src: 'images/title1/6.png', id: 't16'},
        {src: 'images/title1/7.png', id: 't17'},
        {src: 'images/title1/8.png', id: 't18'},
        {src: 'images/title1/9.png', id: 't19'},
        {src: 'images/title1/10.png', id: 't110'},
        {src: 'images/title1/11.png', id: 't111'},
        {src: 'images/title1/12.png', id: 't112'},
        {src: 'images/title1/13.png', id: 't113'},
        {src: 'images/title1/14.png', id: 't114'},

        {src: 'images/title2/0.png', id: 't20'},
        {src: 'images/title2/1.png', id: 't21'},
        {src: 'images/title2/2.png', id: 't22'},
        {src: 'images/title2/3.png', id: 't23'},
        {src: 'images/title2/4.png', id: 't24'},
        {src: 'images/title2/5.png', id: 't25'},
        {src: 'images/title2/6.png', id: 't26'},
        {src: 'images/title2/7.png', id: 't27'},
        {src: 'images/title2/8.png', id: 't28'},
        {src: 'images/title2/9.png', id: 't29'},
        {src: 'images/title2/10.png', id: 't210'},
        {src: 'images/title2/11.png', id: 't211'},
        {src: 'images/title2/12.png', id: 't212'},
        {src: 'images/title2/13.png', id: 't213'},
        {src: 'images/title2/14.png', id: 't214'},

        {src: 'images/title3/0.png', id: 't30'},
        {src: 'images/title3/1.png', id: 't31'},
        {src: 'images/title3/2.png', id: 't32'},
        {src: 'images/title3/3.png', id: 't33'},
        {src: 'images/title3/4.png', id: 't34'},
        {src: 'images/title3/5.png', id: 't35'},
        {src: 'images/title3/6.png', id: 't36'},
        {src: 'images/title3/7.png', id: 't37'},
        {src: 'images/title3/8.png', id: 't38'},
        {src: 'images/title3/9.png', id: 't39'},
        {src: 'images/title3/10.png', id: 't310'},


        {src: 'images/title4/0.png', id: 't40'},
        {src: 'images/title4/1.png', id: 't41'},
        {src: 'images/title4/2.png', id: 't42'},
        {src: 'images/title4/3.png', id: 't43'},
        {src: 'images/title4/4.png', id: 't44'},
        {src: 'images/title4/5.png', id: 't45'},
        {src: 'images/title4/6.png', id: 't46'},
        {src: 'images/title4/7.png', id: 't47'},
        {src: 'images/title4/8.png', id: 't48'},
        {src: 'images/title4/9.png', id: 't49'},
        {src: 'images/title4/10.png', id: 't410'},
        {src: 'images/title4/11.png', id: 't411'},
        {src: 'images/title4/12.png', id: 't412'}

    ];
    //预加载
    loader = new createjs.LoadQueue(false);
    // 关键！----设置并发数
    loader.setMaxConnections(100);
// 关键！---一定要将其设置为 true, 否则不起作用。
    loader.maintainScriptOrder=true;
    loader.installPlugin(createjs.Sound);
    loader.loadManifest(manifest);
    loader.addEventListener('progress', handleFileProgress);//加载完成 调用handleFileProgress函数
    loader.addEventListener('complete', handleComplete);//加载完成 调用handleComplete函数
};

function Hide(arr){
    arr.forEach(e => {
        $(e).hide();
    });
}
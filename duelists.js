//set main namespace
goog.provide('duelists');

// Sprite sheet
goog.require('lime.parser.JSON');
goog.require('lime.ASSETS.duelist.json');
goog.require('lime.SpriteSheet');

// Levels
goog.require('kchodorow.Level');
goog.require('kchodorow.Levels');

// Audio
goog.require('lime.audio.Audio');

//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Polygon');
goog.require('lime.RoundedRect');
goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.RotateBy');

goog.require('kchodorow.lime.SpriteScale9');

var kAntag = 500;
var kGround = 430;
var kHeight = 472;
var kLost = false;
var kProtag = 100;
var kWidth = 700;
var kWon = true;
var kClickEvent = ['mousedown','touchstart'];

// On levels layer
var kDuelistChild = 0;
var kLockChild = 1;

var spriteSheet = null;
var gunshot = null;
var levelUp = null;
var died = null;
var levels = null;
var music = null;

var getLevelsLayer = function() {
    if (levels != null) {
	return levels;
    }

    var bWidth = 100;
    var bHeight = 75;
    var bNumX = 4;
    var bNumY = 3;

    var totalWidth = bWidth*bNumX;
    var totalHeight = bHeight*bNumY;

    levels = new lime.Layer();
    var bg = new lime.RoundedRect().setSize(80, 60).setFill(242, 71, 56, 255)
        .setPosition(0, 0);
    var antag = new lime.Sprite().setFill(spriteSheet.getFrame('antag.png'));
    bg.appendChild(antag);
    goog.events.listen(bg, kClickEvent, showLevel);
    levels.appendChild(bg);
    for (var col = 0; col < bNumY; col++) {
	for (var row = 0; row < bNumX; row++) {
	    if (row == 0 && col == 0) {
		continue;
	    }
	    var bg = new lime.RoundedRect().setSize(80, 60).setFill(242, 71, 56, 255)
		.setPosition(row * 100, col * 75);
	    var sprite = new lime.Sprite().setFill(spriteSheet.getFrame('duelist.png'));
	    var lock = new lime.Sprite().setFill(spriteSheet.getFrame('lock.png'));
	    bg.appendChild(sprite);
	    bg.appendChild(lock);
	    levels.appendChild(bg);
	}
    }
    return levels;
};

// entrypoint
duelists.start = function(){
    spriteSheet = new lime.SpriteSheet('assets/duelist.png',
					    lime.ASSETS.duelist.json,
					    lime.parser.JSON);
    gunshot = new lime.audio.Audio('assets/gunshot.wav');
    levelUp = new lime.audio.Audio('assets/level_up.wav');
    died = new lime.audio.Audio('assets/died.wav');

    this.director = new lime.Director(document.getElementById('game'),kWidth,kHeight);
    this.director.setDisplayFPS(false);
    this.scene = new lime.Scene();

    // Non-spritesheet
    var background = new lime.Sprite().setFill('assets/background.png').setPosition(350, 236);
    this.scene.appendChild(background);

    // Music
    music = new lime.audio.Audio('assets/desert.mp3');
    music.play(true);
    var pauseButton = new lime.Sprite().setFill(spriteSheet.getFrame('pause.png')).setPosition(kWidth-30, 30);
    this.scene.appendChild(pauseButton);
    goog.events.listen(pauseButton, kClickEvent, function() {
	    if (music.isPlaying()) {
		this.setFill(spriteSheet.getFrame('play.png'));
		music.stop();
	    } else {
		this.setFill(spriteSheet.getFrame('pause.png'));
		music.play();
	    }
	});

    this.director.makeMobileWebAppCapable();

    this.openingScene();
};

duelists.openingScene = function() {
    // Protagonists
    this.protag = new lime.Sprite().setFill(spriteSheet.getFrame('protag.png'))
        .setPosition(kProtag, kGround);
    this.scene.appendChild(this.protag);

    // Antagonists
    this.antag = new lime.Sprite().setFill(spriteSheet.getFrame('antag.png'))
        .setPosition(kAntag, kGround).setAnchorPoint(0.5, 1.0);
    this.scene.appendChild(this.antag);

    // Speech bubbles
    this.bubbles = [];

    var antag_bubble = new kchodorow.lime.SpriteScale9().setFill(spriteSheet.getFrame('bubble.png'))
        .scale9(300, 100).setPosition(kWidth/2-150, 100);
    var antag_label = new lime.Label().setSize(280, 80).setPosition(150, 50)
        .setFontSize(24).setFontColor('#BF2A2A').setFontFamily('Luckiest Guy')
        .setText('You must vanquish me and all of my seconds to win the duel.');
    antag_bubble.appendChild(antag_label);
    this.scene.appendChild(antag_bubble);
    this.bubbles.push(antag_bubble);

    // Next button
    var next_bubble = new lime.Sprite().setFill(spriteSheet.getFrame('next.png'))
        .setPosition(kWidth/2, 300);
    var next_label = new lime.Label().setSize(190, 40).setPosition(0, 10)
        .setFontSize(24).setFontColor('#092140').setFontFamily('Luckiest Guy')
        .setText('Agree to duel');
    next_bubble.appendChild(next_label);
    this.scene.appendChild(next_bubble);
    this.bubbles.push(next_bubble);

    goog.events.listen(next_bubble, ['mousedown', 'touchstart'], goog.partial(addSeconds, duelists));

    // set current scene active
    this.director.replaceScene(this.scene);
};

// this => lime.Sprite (next_bubble)
var addSeconds = function(duelists, e) {
    var scene = duelists.scene;

    for (var i = 0; i < duelists.bubbles.length; i++) {
	scene.removeChild(duelists.bubbles[i]);
    }

    var protag_second = new lime.Sprite().setFill(spriteSheet.getFrame('duelist.png'))
        .setPosition(-20, kGround).setAnchorPoint(0.5, 1.0);
    scene.appendChild(protag_second);

    for (var i = 0; i < 10; i++) {
	var antag_second = new lime.Sprite().setFill(spriteSheet.getFrame('duelist.png'))
	    .setPosition(kWidth+20, kGround);
	scene.appendChild(antag_second);
	// Adjust velocity for distance
	antag_second.runAction(new lime.animation.MoveTo(kAntag + 10 + i*10, kGround).setDuration(2));
    }

    protag_second.runAction(new lime.animation.MoveTo(kProtag - 20, kGround).setDuration(2));
    showLevel();

//     var countdown = 3;
//     var prompt = new lime.Label().setSize(100,50).setPosition(kWidth/2, kHeight/2).setFontSize(24)
//         .setText("3").setFontColor('#000');
//     scene.appendChild(prompt);

//     var last_update = 0;
//     var update_prompt = function() {
// 	--countdown;
// 	if (countdown <= 0) {
// 	    scene.removeChild(prompt);
// 	    duelists.showLevel();
// 	} else {
// 	    prompt.setText(countdown);
// 	}
//     };
//     window.setTimeout(update_prompt, 1000);
//     window.setTimeout(update_prompt, 2000);
//     window.setTimeout(update_prompt, 3000);

//     var antagIsDead = false;
//     var shootSecond = function(e){
//         gunshot.play();
// 	protag_second.runAction(new lime.animation.RotateBy(90));
//     };
//     lime.scheduleManager.callAfter(shootSecond, protag_second, 3000);
//     var shootProtag = function(e) {
// 	if (antagIsDead) {
// 	    return;
// 	}
// 	gunshot.play();
// 	duelists.protag.runAction(new lime.animation.RotateBy(90));
// 	lime.scheduleManager.callAfter(goog.partial(duelists.gameOver, duelists), duelists, 3000);
//     };
//     lime.scheduleManager.callAfter(shootProtag, duelists.protag, 4000);
 
//     goog.events.listen(duelists.antag, kClickEvent, function(e){
//         gunshot.play();
// 	duelists.antag.runAction(new lime.animation.RotateBy(-90));
//     });
};

currentLevel = 0;
var endGame = function(won) {
    lime.scheduleManager.unschedule(runTimer, duelists.board.timer);
    dotCount = 0;

    // Remove board
    duelists.scene.removeChild(duelists.board);
    // Pop the last child: the banner
    duelists.scene.removeChildAt(duelists.scene.getNumberOfChildren()-1);

    // Display levels
    var levels = getLevelsLayer();
    levels.setPosition(200, -200);
    duelists.scene.appendChild(levels);
    levels.runAction(new lime.animation.MoveTo(200, 100));

    var sprite = levels.children_[currentLevel];

    if (!won) {
	if (music.isPlaying()) {
	    died.play();
	}
	var x = new lime.Sprite().setFill(spriteSheet.getFrame('x.png'));
	sprite.appendChild(x);
	sprite.x = x;
	return;
    }

    if (music.isPlaying()) {
	levelUp.play();
    }
    sprite.removeChild(sprite.x);
    var star = new lime.Sprite().setFill(spriteSheet.getFrame('star.png'));
    sprite.appendChild(star);

    currentLevel++;

    // TODO: test
    if (currentLevel > 10) {
	var star = new lime.Sprite().setFill(spriteSheet.getFrame('star.png'))
	    .setSize(300, 300).setPosition(kWidth/2, kHeight/2);
	var youWin = new lime.Label().setText("YOU WIN!").setFontFamily('Luckiest Guy');
	star.appendChild(youWin);
	duelists.scene.appendChild(star);
	return;
    }

    var nextLevel = levels.children_[currentLevel];
    nextLevel.removeChild(nextLevel.children_[kLockChild]);
    goog.events.listen(nextLevel, kClickEvent, showLevel);
};

var dotCount = 0;
var curColor = null;
var selectDot = function(e) {
    // Don't allow multiple clicks on the same dot
    if (this.clicked) {
	return;
    }
    this.clicked = true;

    lime.scheduleManager.unschedule(shrinkDot, this);
    if (music.isPlaying()) {
	gunshot.play();
    }
    if (this.color == curColor) {
	dotCount++;
    } else {
	dotCount = 1;
	// Reschedule all dots?
    }
    curColor = this.color;
    if (dotCount >= 3) {
	endGame(kWon);
    }
};

var kTargetAlpha = 175;

// shrink 30 px over 5 seconds = 6px/sec = .006px/ms
var shrinkDot = function(dt) {
    var size = this.getSize();
    // If it's too small, reset
    if (size.width < 1) {
	// Change size
	var newSize = Math.floor(Math.random()*20)+10; // 10px - 30px
	this.setSize(newSize, newSize);

	// Change color
	var newColor = kchodorow.Levels[currentLevel].getColor();
	this.setFill(newColor.r, newColor.g, newColor.b, kTargetAlpha);
	this.color = newColor.r*256*256+newColor.g*256+newColor.b;
    } else {
	var newSize = new goog.math.Size(size.width-(dt*.006), size.height-(dt*.006));
	this.setSize(newSize);
    }
};

var showLevel = function() {
    var levelsLayer = getLevelsLayer();
    duelists.scene.removeChild(levelsLayer);

    var boardX = 200;

    var level = kchodorow.Levels[currentLevel];
    // TODO: fix centering
    var board = new lime.Layer().setPosition(boardX, -100);
    for (var i = 0; i < level.getWidth(); i++) {
	for (var j = 0; j < level.getHeight(); j++) {
	    var startingSize = Math.floor(Math.random()*20)+10; // 10px - 30px
	    var color = level.getColor();
	    var dot = new lime.Circle().setFill(color.r, color.g, color.b, 175)
		.setSize(startingSize, startingSize).setPosition(i*50, j*50);
	    dot.color = color.r*256*256+color.g*256+color.b;
	    // Between 3 & 5
	    dot.shrinker = lime.scheduleManager.schedule(shrinkDot, dot);
	    goog.events.listen(dot, kClickEvent, selectDot);
	    board.appendChild(dot);
	}
    }
    duelists.board = board;

    var timer = new lime.Label().setFontFamily('Luckiest Guy')
        .setText(level.getSeconds())
        .setFontSize(24).setFontColor(9, 33, 64)
        .setPosition(-100, 150);
    timer.numeric_time = level.getSeconds();
    timer.last_update = 0;
    lime.scheduleManager.schedule(runTimer, timer);
    board.appendChild(timer);
    board.timer = timer;

    var banner_label = new lime.Label().setFontFamily('Luckiest Guy')
        .setText("Shoot three circles of the same color in a row before the timer runs out")
        .setFontSize(24).setFontColor(9, 33, 64)
        .setPosition(kWidth/2, 100).setSize(kWidth-20, 150);
    duelists.scene.appendChild(banner_label);
    
    duelists.scene.appendChild(board);
    board.runAction(new lime.animation.MoveTo(boardX, 70));
};

var runTimer = function t(dt) {
    this.last_update += dt;
    if (this.last_update > 1000) {
	this.numeric_time--;
	this.setText(this.numeric_time);
	if (this.numeric_time == 0) {
	    endGame(kLost);
	    return;
	}
	this.last_update = this.last_update - 1000;
    }
}

duelists.gameOver = function(duelists) {
    var scene = new lime.Scene();
    var label = new lime.Label().setText("Game over").setPosition(kWidth/2, kHeight/2)
        .setFontFamily('Luckiest Guy');
    scene.appendChild(label);
    // TODO: play again button
    this.director.replaceScene(scene, lime.transitions.Dissolve, 2);
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('duelists.start', duelists.start);

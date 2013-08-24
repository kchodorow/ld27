//set main namespace
goog.provide('duelists');

// Sprite sheet
goog.require('lime.parser.JSON');
goog.require('lime.ASSETS.duelist.json');
goog.require('lime.SpriteSheet');

// Audio
goog.require('lime.audio.Audio');

//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
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
var kProtag = 100;
var kWidth = 700;
var kClickEvent = ['mousedown','touchstart'];

// On levels layer
var kDuelistChild = 0;
var kLockChild = 1;

var spriteSheet = null;
var gunshot = null;
var levels = null;

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

    levels = new lime.Layer().setPosition(200, (kHeight-totalHeight/2)/2);
    var bg = new lime.RoundedRect().setSize(80, 60).setFill(242, 71, 56, 255)
        .setPosition(0, 0);
    var antag = new lime.Sprite().setFill(spriteSheet.getFrame('antag.png'));
    bg.appendChild(antag);
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

    this.director = new lime.Director(document.getElementById('game'),kWidth,kHeight);
    this.scene = new lime.Scene();

    // Non-spritesheet
    var background = new lime.Sprite().setFill('assets/background.png').setPosition(350, 236);
    this.scene.appendChild(background);

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
    var protag_bubble = new kchodorow.lime.SpriteScale9().setFill(spriteSheet.getFrame('bubble.png'))
        .scale9(300, 100).setPosition(100, 50);
    var protag_label = new lime.Label().setSize(280, 80).setPosition(150, 50)
        .setFontSize(24).setFontColor('#092140')
        .setText('To win, you must vanquish me and my second.');
    protag_bubble.appendChild(protag_label);
    this.scene.appendChild(protag_bubble);
    this.bubbles.push(protag_bubble);

    // Next button
    var antag_bubble = new kchodorow.lime.SpriteScale9().setFill(spriteSheet.getFrame('bubble.png'))
        .scale9(300, 100).setPosition(230, 150);
    var antag_label = new lime.Label().setSize(280, 80).setPosition(150, 50)
        .setFontSize(24).setFontColor('#BF2A2A')
        .setText('And you must vanquish me and mine.');
    antag_bubble.appendChild(antag_label);
    this.scene.appendChild(antag_bubble);
    this.bubbles.push(antag_bubble);

    var next_bubble = new lime.Sprite().setFill(spriteSheet.getFrame('next.png'))
        .setPosition(100, 250);
    var next_label = new lime.Label().setSize(190, 40).setPosition(100, 25)
        .setFontSize(24).setFontColor('#092140')
        .setText('Agree to terms');
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
var endGame = function() {
    var layer = this.getParent();
    var scene = layer.getParent();

    // Remove board
    scene.removeChild(layer);

    // Display levels
    var levels = getLevelsLayer();
    var sprite = levels.children_[currentLevel];
    var star = new lime.Sprite().setFill(spriteSheet.getFrame('star.png'));
    sprite.appendChild(star);
    scene.appendChild(levels);

    currentLevel++;
    dotCount = 0;

    // TODO: 
    if (currentLevel > 10) {
    }

    var nextLevel = levels.children_[currentLevel];
    nextLevel.removeChild(nextLevel.children_[kLockChild]);
    goog.events.listen(nextLevel, kClickEvent, showLevel);
};

var dotCount = 0;
var selectDot = function(e) {
    lime.scheduleManager.unschedule(shrinkDot, this);
    dotCount++;
    gunshot.play();
    if (dotCount >= 3) {
	endGame.call(this);
    }
}

// shrink 30 px over 5 seconds = 6px/sec = .006px/ms
var shrinkDot = function(dt) {
    var size = this.getSize();
    // If it's too small, reset
    if (size.width < 1) {
	var newSize = Math.floor(Math.random()*20)+10; // 10px - 30px
	this.setSize(newSize, newSize);
    } else {
	var newSize = new goog.math.Size(size.width-(dt*.006), size.height-(dt*.006));
	this.setSize(newSize);
    }
};

var showLevel = function() {
    var levelsLayer = getLevelsLayer();
    duelists.scene.removeChild(levelsLayer);

    var level = new lime.Layer().setPosition(kWidth/2, kHeight/2);
    for (var i = 0; i < 3; i++) {
	for (var j = 0; j < 3; j++) {
	    var startingSize = Math.floor(Math.random()*20)+10; // 10px - 30px
	    var dot = new lime.Circle().setFill(2, 73, 89, 175)
		.setSize(startingSize, startingSize).setPosition(i*50, j*50);
	    // Between 3 & 5
	    dot.shrinker = lime.scheduleManager.schedule(shrinkDot, dot);
	    goog.events.listen(dot, kClickEvent, selectDot);
	    level.appendChild(dot);
	}
    }
    duelists.scene.appendChild(level);
}

duelists.gameOver = function(duelists) {
    var scene = new lime.Scene();
    var label = new lime.Label().setText("Game over").setPosition(kWidth/2, kHeight/2);
    scene.appendChild(label);
    // TODO: play again button
    this.director.replaceScene(scene, lime.transitions.Dissolve, 2);
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('duelists.start', duelists.start);

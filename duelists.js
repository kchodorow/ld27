//set main namespace
goog.provide('duelists');

// Sprite sheet
goog.require('lime.parser.JSON');
goog.require('lime.ASSETS.duelist.json');
goog.require('lime.SpriteSheet');

goog.require('kchodorow.Player');

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
goog.require('lime.RoundedRect');
goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.KeyframeAnimation');

goog.require('kchodorow.lime.SpriteScale9');

var kAntag = 400;
var kGround = 430;
var kHeight = 472;
var kLost = false;
var kProtag = 200;
var kWidth = 700;
var kWon = true;
var kClickEvent = ['mousedown','touchstart'];

// Tracking phase hack
var kPhase = 0;
var kBoardPhase = 0;
var kLevelsPhase = 1;

// On levels layer
var kDuelistChild = 0;
var kLockChild = 1;

var spriteSheet = null;
var gunshot = null;
var levelUp = null;
var died = null;
var levels = null;
var music = null;
var player = null;
var enemy = null;

var getLevelsLayer = function() {
    if (levels != null) {
	return levels;
    }

    var bWidth = 120;
    var bHeight = 100;
    var bNumX = 4;
    var bNumY = 3;

    var totalWidth = bWidth*bNumX;
    var totalHeight = bHeight*bNumY;

    levels = new lime.Layer();
    for (var row = 0; row < 3; row++) {
	for (var col = 0; col < 4; col++) {
	    if (row == 2 && col == 3) {
		continue;
	    }
	    var bg = new lime.RoundedRect().setSize(100, 80).setFill(242, 71, 56, 255)
		.setPosition(col * bWidth, row * bHeight);
	    var num = row*bNumX+col;
	    var sprite = new lime.Sprite().setFill(spriteSheet.getFrame('antag0'+num+'.png'));
	    bg.appendChild(sprite);

	    // Don't show a lock on the first level, ever.
	    if (row != 0 || col != 0) {
		var lock = new lime.Sprite().setFill(spriteSheet.getFrame('lock.png'));
		bg.appendChild(lock);
		bg.lock = lock;
	    }
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

    player = new kchodorow.Player(true);
    enemy = new kchodorow.Player(false);

    // Non-spritesheet
    var background = new lime.Sprite().setFill('assets/background.png').setPosition(350, 236);
    this.scene.appendChild(background);

    // Music
    music = new lime.audio.Audio('assets/desert.mp3');
    music.play(true);
    goog.events.listen(music, 'loaded', openingScene);

    var loading = new lime.Label().setText("Loading...").setFontSize(24)
        .setPosition(kWidth/2, kHeight/2);
    this.scene.appendChild(loading);
    this.scene.loading = loading;

    this.director.makeMobileWebAppCapable();

    // set current scene active
    this.director.replaceScene(this.scene);
};

var openingScene = function() {
    duelists.scene.removeChild(duelists.scene.loading);

    var splash = new lime.Label().setText('Dirty Rotten Seconds')
        .setFontSize(50).setFontColor('#092140').setFontFamily('Luckiest Guy')
        .setPosition(kWidth/2, 100).setSize(kWidth, 100);
    duelists.scene.appendChild(splash);
    duelists.scene.splash = splash;

    var pauseButton = new lime.Sprite().setFill(spriteSheet.getFrame('pause.png'))
        .setPosition(kWidth-40, 40);
    duelists.scene.appendChild(pauseButton);
    duelists.pause = pauseButton;
    goog.events.listen(pauseButton, kClickEvent, function() {
	    if (music.isPlaying()) {
		this.setFill(spriteSheet.getFrame('play.png'));
		music.stop();
	    } else {
		this.setFill(spriteSheet.getFrame('pause.png'));
		music.play();
	    }
	});

    // Protagonists
    duelists.protag = new lime.Sprite().setFill(spriteSheet.getFrame('protag.png'))
        .setPosition(kProtag, kGround);
    duelists.scene.appendChild(duelists.protag);

    // Antagonists
    duelists.antag = new lime.Sprite().setFill(spriteSheet.getFrame('antag00.png'))
        .setPosition(kAntag, kGround);
    duelists.scene.appendChild(duelists.antag);
    duelists.scene.antags = [duelists.antag];
    duelists.scene.curAntag = duelists.antag;

    // Speech bubbles
    duelists.bubbles = [];

    var antag_bubble = new kchodorow.lime.SpriteScale9().setFill(spriteSheet.getFrame('bubble.png'))
        .scale9(300, 100).setPosition(kWidth/2-150, 150);
    var dart = new lime.Sprite().setFill(spriteSheet.getFrame('dart.png')).setPosition(220, 174);
    antag_bubble.appendChild(dart);
    var antag_label = new lime.Label().setSize(280, 80).setPosition(150, 50)
        .setFontSize(24).setFontColor('#BF2A2A').setFontFamily('Luckiest Guy')
        .setText('You must vanquish me and all of my seconds to win the duel.');
    antag_bubble.appendChild(antag_label);
    duelists.scene.appendChild(antag_bubble);
    duelists.bubbles.push(antag_bubble);

    // Next button
    var next_bubble = new lime.Sprite().setFill(spriteSheet.getFrame('next.png'))
        .setPosition(kWidth/2, 300);
    var next_label = new lime.Label().setSize(190, 40).setPosition(0, 10)
        .setFontSize(24).setFontColor('#092140').setFontFamily('Luckiest Guy')
        .setText('Agree to duel');
    next_bubble.appendChild(next_label);
    duelists.scene.appendChild(next_bubble);
    duelists.bubbles.push(next_bubble);

    goog.events.listen(next_bubble, ['mousedown', 'touchstart'], 
		       goog.partial(addSeconds, duelists));
};

// this => lime.Sprite (next_bubble)
var addSeconds = function(duelists, e) {
    var scene = duelists.scene;
    scene.removeChild(scene.splash);

    for (var i = 0; i < duelists.bubbles.length; i++) {
	scene.removeChild(duelists.bubbles[i]);
    }

    var protag_second = new lime.Sprite().setFill(spriteSheet.getFrame('protag_second.png'))
        .setPosition(kProtag - 50, kGround);
    scene.appendChild(protag_second);
    scene.protag_second = protag_second;

    for (var i = 1; i <= 10; i++) {
	var pos_x = Math.random()*10+kAntag+20*i+50;
	var pos_y = kGround - Math.random()*10;
	var antag_second = new lime.Sprite().setFill(spriteSheet.getFrame('antag0'+i+'.png'))
	    .setPosition(pos_x, pos_y);
	scene.appendChild(antag_second);
	scene.antags.push(antag_second);
    }

    showLevel(0);
};

currentLevel = 0;
var endGame = function(won) {
    kPhase = kLevelsPhase;
    lime.scheduleManager.unschedule(runTimer, duelists.board.timer);
    dotCount = 0;

    // Remove board
    duelists.scene.removeChild(duelists.board);
    // Pop the last child: the banner
    duelists.scene.removeChildAt(duelists.scene.getNumberOfChildren()-1);

    player.reset();
    enemy.reset();
    duelists.scene.removeChild(duelists.banner);

    if (currentLevel == 10 && won) {
	duelists.scene.protag_second.runAction(new lime.animation.MoveBy(-200, 0).setDuration(3));
	duelists.scene.curAntag.runAction(new lime.animation.Spawn(new lime.animation.RotateBy(720),
								   new lime.animation.ScaleTo(0.0)));

	var layer = new lime.Layer();
	var star1 = new lime.Sprite().setFill(spriteSheet.getFrame('star.png')).setPosition(100, -100);
	var star2 = new lime.Sprite().setFill(spriteSheet.getFrame('star.png')).setPosition(600, -100);
	var youWon = new lime.Label().setText("You won!").setFontFamily('Luckiest Guy')
	    .setFontSize(40).setFontColor(9, 33, 64)
	    .setPosition(kWidth/2, -100);
	layer.appendChild(youWon);
	layer.appendChild(star1);
	layer.appendChild(star2);

	var playAgain = new lime.Label().setText("Play again?").setFontFamily('Luckiest Guy')
	    .setFontSize(24).setFontColor(9, 33, 64)
	    .setPosition(-10, 5);
	var next_bubble = new lime.Sprite().setFill(spriteSheet.getFrame('next.png'))
	    .setPosition(kWidth/2, 50);
	next_bubble.appendChild(playAgain);
	goog.events.listen(next_bubble, ['mousedown', 'touchstart'], restart);

	layer.appendChild(next_bubble);
	layer.runAction(new lime.animation.MoveTo(0, 200));

	duelists.scene.appendChild(layer);

	// Walk into sunset
	duelists.protag.runAction(new lime.animation.Spawn(new lime.animation.MoveTo(300, 400).setDuration(20).setEasing(lime.animation.Easing.LINEAR),
							   new lime.animation.ScaleTo(0).setDuration(20)));
	return;
    }

    // Display levels
    var levelsX = 175;
    var levels = getLevelsLayer();
    levels.setPosition(levelsX, -200);
    duelists.scene.appendChild(levels);
    duelists.scene.appendChild(duelists.pause);
    levels.runAction(new lime.animation.MoveTo(levelsX, 100));

    var sprite = levels.children_[currentLevel];
    if (currentLevel == 0) {
	goog.events.listen(sprite, kClickEvent, showLevel);
    }

    if (!won) {
	duelists.protag.runAction(new lime.animation.Spawn(new lime.animation.RotateBy(720),
							   new lime.animation.ScaleTo(0.0)));

	if (music.isPlaying()) {
	    died.play();
	}

	// If we haven't added an x NOR a star, add an x.  If we've added a star, 
	// don't unstar.
	if (!sprite.x && !sprite.star) {
	    var x = new lime.Sprite().setFill(spriteSheet.getFrame('x.png'));
	    sprite.appendChild(x);
	    sprite.x = x;
	}

	return;
    }

    duelists.antag.runAction(new lime.animation.Spawn(new lime.animation.RotateBy(720),
						      new lime.animation.ScaleTo(0.0)));

    if (music.isPlaying()) {
	levelUp.play();
    }

    sprite.removeChild(sprite.x);
    var star = new lime.Sprite().setFill(spriteSheet.getFrame('star.png'));
    sprite.appendChild(star);
    sprite.star = star;

    currentLevel++;

    var nextLevel = levels.children_[currentLevel];
    nextLevel.removeChild(nextLevel.lock);
    goog.events.listen(nextLevel, kClickEvent, showLevel);
};

var restart = function() {
    currentLevel = 0;
    levels = null;

    layer = this.getParent();
    duelists.scene.removeChild(layer);
    duelists.openingScene();
};

var selectDot = function(p) {
    // Don't allow multiple clicks on the same dot
    if (this.clicked || kPhase == kLevelsPhase) {
	return;
    }
    this.clicked = true;

    var bullet_hole = new lime.Circle().setSize(5,5).setFill(9, 33, 64, 255);
    this.appendChild(bullet_hole);
    lime.scheduleManager.unschedule(shrinkDot, this);
    if (music.isPlaying()) {
	gunshot.play();
    }

    p.register(this);

    if (p.getDotCount() >= kchodorow.Levels[currentLevel].getGoal()) {
	endGame(p.isPlayer());
    }
};

var kTargetAlpha = 175;

// shrink 30 px over 5 seconds = 6px/sec = .006px/ms
var shrinkDot = function(dt) {
    var level = kchodorow.Levels[currentLevel];
    var size = this.getSize();
    // If it's too small, reset
    if (size.width < 1) {
	// Change size
	var newSize = Math.floor(Math.random()*20)+10; // 10px -> 30px
	this.setSize(newSize, newSize);

	// Change color
	var newColor = level.getColor();
	this.setFill(newColor.r, newColor.g, newColor.b, kTargetAlpha);
	this.color = newColor.r*256*256+newColor.g*256+newColor.b;
    } else {
	var newSize = new goog.math.Size(size.width-(dt*level.getDotVelocity()), size.height-(dt*level.getDotVelocity()));
	this.setSize(newSize);
    }
};

var kSquare = 50;
var boardX = 200;

var showLevel = function(levelNum) {
    kPhase = kBoardPhase;
    if (levelNum instanceof goog.events.Event) {
	currentLevel = this.getParent().getChildIndex(this);
    } else {
	currentLevel = levelNum;
    }

    var levelsLayer = getLevelsLayer();
    duelists.scene.removeChild(levelsLayer);

    var level = kchodorow.Levels[currentLevel];
    // TODO: fix centering
    var board = new lime.Layer().setPosition(boardX, kHeight*2);
    for (var i = 0; i < level.getWidth(); i++) {
	for (var j = 0; j < level.getHeight(); j++) {
	    var startingSize = Math.floor(Math.random()*20)+10; // 10px -> 30px
	    var color = level.getColor();
	    var dot = new lime.Circle().setFill(color.r, color.g, color.b, 175)
		.setSize(startingSize, startingSize).setPosition(i*kSquare, j*kSquare);
	    dot.x = i;
	    dot.y = j;
	    dot.color = color.r*256*256+color.g*256+color.b;
	    // Between 3 & 5
	    dot.shrinker = lime.scheduleManager.schedule(shrinkDot, dot);
	    goog.events.listen(dot, kClickEvent, goog.partial(selectDot, player));
	    board.appendChild(dot);
	}
    }
    duelists.board = board;

    // Reset protagonist & antagonist for level
    duelists.scene.curAntag.setScale(0.0);
    duelists.scene.curAntag = duelists.scene.antags[currentLevel];
    duelists.scene.curAntag.setPosition(kAntag, kGround).setScale(1.0);
    duelists.protag.setPosition(kProtag, kGround).setScale(1.0);

    var goalCount = new lime.Label().setFontFamily('Luckiest Guy')
        .setText("0")
        .setFontSize(24).setFontColor(9, 33, 64)
        .setPosition(-100, 150);
    board.appendChild(goalCount);
    player.setCounter(goalCount);

    var enemyGoalCount = new lime.Label().setFontFamily('Luckiest Guy')
        .setText("0")
        .setFontSize(24).setFontColor('#BF2A2A')
        .setPosition(350, 150);
    board.appendChild(enemyGoalCount);
    enemy.setCounter(enemyGoalCount);

    var banner = new lime.Sprite().setFill(spriteSheet.getFrame('banner.png'))
        .setSize(kWidth, 100).setPosition(kWidth/2, -200)
    var banner_label = new lime.Label().setFontFamily('Luckiest Guy')
        .setText("Shoot "+level.getGoal()+" circles of the same color in a row before your opponent does")
        .setFontSize(24).setFontColor(9, 33, 64)
        .setSize(kWidth-200, 90).setPosition(0, 25);
    banner.appendChild(banner_label);
    duelists.scene.appendChild(banner);
    duelists.banner = banner;
    banner.runAction(new lime.animation.MoveTo(kWidth/2, kHeight/2));

    goog.events.listen(banner, kClickEvent, dropBoard);

    // Hack to remove and re-add the pause button so it'll be on top of the banner
    duelists.scene.removeChild(duelists.pause);
    duelists.scene.appendChild(duelists.pause);
};

var dropBoard = function() {
    addEnemy(duelists.board);
    duelists.scene.appendChild(duelists.board);
    duelists.board.runAction(new lime.animation.MoveTo(boardX, 120));

    this.runAction(new lime.animation.MoveTo(kWidth/2, 50));
};

var addEnemy = function(board) {
    if ('gun' in board) {
	return;
    }
    var level = kchodorow.Levels[currentLevel];
    var width = level.getWidth()*kSquare;
    var height = level.getHeight()*kSquare;

    var start_x = Math.random()*width;
    var start_y = Math.random()*height;
    var gun = new lime.Sprite().setFill(spriteSheet.getFrame('gun.png'))
        .setPosition(start_x, start_y).setAnchorPoint(0, .2).setRotation(30);
    board.appendChild(gun);
    board.gun = gun;

    chooseGunTarget(gun);
};

var chooseGunTarget = function(gun) {
    strategyChooseBlocking(gun);
    
    var anim = new lime.animation.MoveTo(gun.end_x*kSquare, gun.end_y*kSquare)
        .setDuration(kchodorow.Levels[currentLevel].getGunSpeed());
    gun.runAction(anim);
    goog.events.listen(anim, ['stop'], goog.partial(shoot, gun));
};

var strategyChooseRandom = function(gun) {
    var level = kchodorow.Levels[currentLevel];
    var end_x = Math.floor(Math.random()*level.getWidth());
    var end_y = Math.floor(Math.random()*level.getHeight());
    var index = end_x+end_y*level.getWidth();
    var child = duelists.board.children_[index];
    for (var i = index; i < duelists.board.getNumberOfChildren(); i++) {
	end_x = Math.floor(Math.random()*level.getWidth());
	end_y = Math.floor(Math.random()*level.getHeight());
	child = duelists.board.children_[end_x+end_y*level.getWidth()];
	if (!child.clicked) {
	    break;
	}
    }
    if (!child.clicked) {
	for (var i = index-1; i >= 0; i--) {
	    end_x = Math.floor(Math.random()*level.getWidth());
	    end_y = Math.floor(Math.random()*level.getHeight());
	    child = duelists.board.children_[end_x+end_y*level.getWidth()];
	    if (!child.clicked) {
		break;
	    }
	}
	if (child.clicked) {
	    endGame(kLost);
	    return;
	}
    }

    if (child.clicked) {
	endGame(kLost);
	return;
    }

    gun.end_x = end_x;
    gun.end_y = end_y;
};

var strategyChooseBlocking = function(gun) {
    var level = kchodorow.Levels[currentLevel];

    // Find last player click x & y
    var lastClick = player.getLastClick();
    if (lastClick == null) {
	strategyChooseRandom(gun);
	return;
    }
    var color = player.getColor();

    var maxDot = null;
    var maxSize = 0;
    // Locate the largest circle of that color on the board
    for (var i = 0; i < level.getWidth(); i++) {
	for (var j = 0; j < level.getHeight(); j++) {
	    var dot = duelists.board.children_[i+j*level.getWidth()];
	    if (dot.clicked || dot.color != color) {
		continue;
	    }

	    if (dot.getSize().width > maxSize) {
		maxSize = dot.getSize().width;
		maxDot = dot;
	    }
	}
    }

    if (maxDot == null) {
	strategyChooseRandom(gun);
	return;
    }

    gun.end_x = maxDot.x;
    gun.end_y = maxDot.y;
};

var shoot = function(gun) {
    var level = kchodorow.Levels[currentLevel];
    var circle = duelists.board.children_[gun.end_x*level.getHeight()+gun.end_y];
    var size = circle.getSize();
    if (circle.getSize().width > 5) {
	selectDot.call(circle, enemy);
    }

    var end_x = Math.floor(Math.random()*level.getWidth());
    var end_y = Math.floor(Math.random()*level.getHeight());
    if (kPhase == kBoardPhase) {
	chooseGunTarget(gun);
    }
};

var runTimer = function t(dt) {
    this.last_update += dt;
    if (this.last_update > 1000) {
	this.numeric_time--;
	if (this.numeric_time < 0) {
	    //	    endGame(kLost);
	    return;
	}
	this.setText(this.numeric_time);
	this.last_update = this.last_update - 1000;
    }
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('duelists.start', duelists.start);

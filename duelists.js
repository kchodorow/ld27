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
goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.RotateBy');

goog.require('kchodorow.lime.SpriteScale9');

var kGround = 430;
var kProtag = 100;
var kAntag = 500;

// entrypoint
duelists.start = function(){
    this.spriteSheet = new lime.SpriteSheet('assets/duelist.png',
					    lime.ASSETS.duelist.json,
					    lime.parser.JSON);

    this.director = new lime.Director(document.getElementById('game'),700,472);
    this.scene = new lime.Scene();

    // Non-spritesheet
    var background = new lime.Sprite().setFill('assets/background.png').setPosition(350, 236);
    this.scene.appendChild(background);

    this.openingScene();
};

duelists.openingScene = function() {
    var gunshot = new lime.audio.Audio('assets/gunshot.wav');

    // Protagonists
    var protag = new lime.Sprite().setFill(this.spriteSheet.getFrame('protag.png'))
        .setPosition(kProtag, kGround);
    var protag_second = new lime.Sprite().setFill(this.spriteSheet.getFrame('duelist.png'))
        .setPosition(kProtag - 20, kGround).setAnchorPoint(0.5, 1.0);
    this.scene.appendChild(protag);
    this.scene.appendChild(protag_second);

    // Antagonists
    var antag = new lime.Sprite().setFill(this.spriteSheet.getFrame('antag.png'))
        .setPosition(kAntag, kGround).setAnchorPoint(0.5, 1.0);
    this.scene.appendChild(antag);

    var protag_bubble = new kchodorow.lime.SpriteScale9().setFill(this.spriteSheet.getFrame('bubble.png'))
        .scale9(300, 100).setPosition(100, 50);
    var protag_label = new lime.Label().setSize(280, 80).setPosition(150, 50)
        .setFontSize(24).setFontColor('#092140')
        .setText('To win, you must vanquish me and my second.');
    protag_bubble.appendChild(protag_label);
    this.scene.appendChild(protag_bubble);

    // Next button
    var antag_bubble = new kchodorow.lime.SpriteScale9().setFill(this.spriteSheet.getFrame('bubble.png'))
        .scale9(300, 100).setPosition(230, 150);
    var antag_label = new lime.Label().setSize(280, 80).setPosition(150, 50)
        .setFontSize(24).setFontColor('#BF2A2A')
        .setText('And you must vanquish me and mine.');
    antag_bubble.appendChild(antag_label);
    this.scene.appendChild(antag_bubble);

    var next_bubble = new kchodorow.lime.SpriteScale9().setFill(this.spriteSheet.getFrame('next.png'))
        .scale9(200, 50).setPosition(100, 250);
    var next_label = new lime.Label().setSize(190, 40).setPosition(100, 25)
        .setFontSize(24).setFontColor('#092140')
        .setText('Agree to terms');
    next_bubble.appendChild(next_label);
    this.scene.appendChild(next_bubble);

    for (var i = 0; i < 10; i++) {
	var antag_second = new lime.Sprite().setFill(this.spriteSheet.getFrame('duelist.png'))
	    .setPosition(kAntag + 10 + i*10, kGround);
	this.scene.appendChild(antag_second);
    }

    this.director.makeMobileWebAppCapable();

    var countdown = 3;
    var prompt = new lime.Label().setSize(100,50).setPosition(500, 500).setFontSize(20)
        .setText("3").setFontColor('#000');
    this.scene.appendChild(prompt);

    var last_update = 0;
    var update_prompt = function() {
	--countdown;
	if (countdown <= 0) {
	    prompt.setText("Shoot!");
	} else {
	    prompt.setText(countdown);
	}
    };
    window.setTimeout(update_prompt, 1000);
    window.setTimeout(update_prompt, 2000);
    window.setTimeout(update_prompt, 3000);

    var shootSecond = function(e){
        gunshot.play();
	protag_second.runAction(new lime.animation.RotateBy(90));
    };
    lime.scheduleManager.callAfter(shootSecond, protag_second, 3000);

    goog.events.listen(antag,['mousedown','touchstart'],function(e){
        gunshot.play();
	antag.runAction(new lime.animation.RotateBy(-90));
    });

    // set current scene active
    this.director.replaceScene(this.scene);
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('duelists.start', duelists.start);

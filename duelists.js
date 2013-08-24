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
    var spriteSheet = new lime.SpriteSheet('assets/duelist.png',
					   lime.ASSETS.duelist.json,
					   lime.parser.JSON);
    var gunshot = new lime.audio.Audio('assets/gunshot.wav');

    var director = new lime.Director(document.getElementById('game'),700,472);
    var scene = new lime.Scene();

    // Non-spritesheet
    var background = new lime.Sprite().setFill('assets/background.png').setPosition(350, 236);
    scene.appendChild(background);

    // Protagonists
    var protag = new lime.Sprite().setFill(spriteSheet.getFrame('protag.png'))
        .setPosition(kProtag, kGround);
    var protag_second = new lime.Sprite().setFill(spriteSheet.getFrame('duelist.png'))
        .setPosition(kProtag - 20, kGround).setAnchorPoint(0.5, 1.0);
    scene.appendChild(protag);
    scene.appendChild(protag_second);

    // Antagonists
    var antag = new lime.Sprite().setFill(spriteSheet.getFrame('antag.png'))
        .setPosition(kAntag, kGround).setAnchorPoint(0.5, 1.0);
    scene.appendChild(antag);

    var bubble = new kchodorow.lime.SpriteScale9().setFill(spriteSheet.getFrame('bubble.png'))
        .scale9(300, 100).setPosition(100, 50);
    var label = new lime.Label().setSize(280, 80).setPosition(150, 50)
        .setFontSize(24).setFontColor('#BF2A2A')
        .setText('To win, you must vanquish me and my second.');
    bubble.appendChild(label);
    scene.appendChild(bubble);

    for (var i = 0; i < 10; i++) {
	var antag_second = new lime.Sprite().setFill(spriteSheet.getFrame('duelist.png'))
	    .setPosition(kAntag + 10 + i*10, kGround);
	scene.appendChild(antag_second);
    }

    director.makeMobileWebAppCapable();

    var countdown = 3;
    var prompt = new lime.Label().setSize(100,50).setPosition(500, 500).setFontSize(20)
        .setText("3").setFontColor('#000');
    scene.appendChild(prompt);

    var last_update = 0;
    var update_prompt = function() {
	--countdown;
	if (countdown <= 0) {
	    prompt.setText("Shoot!");
	    lime.scheduleManager.unschedule(this);
	} else {
	    prompt.setText(countdown);
	}
    };
    window.setTimeout(update_prompt, 1000);
    window.setTimeout(update_prompt, 2000);
    window.setTimeout(update_prompt, 3000);
    //    lime.scheduleManager.schedule(update_prompt, antag);

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
    director.replaceScene(scene);
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('duelists.start', duelists.start);

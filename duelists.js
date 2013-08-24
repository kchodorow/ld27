//set main namespace
goog.provide('duelists');

// Sprite sheet
goog.require('lime.parser.JSON');
goog.require('lime.ASSETS.duelist.json');
goog.require('lime.SpriteSheet');

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


// entrypoint
duelists.start = function(){
    var spriteSheet = new lime.SpriteSheet('assets/duelist.png',
					   lime.ASSETS.duelist.json,
					   lime.parser.JSON);

    var director = new lime.Director(document.body,1024,768);
    var scene = new lime.Scene();

    var protag = new lime.Sprite().setFill(spriteSheet.getFrame('duelist.png'))
        .setPosition(30, 400);
    
    var target = new lime.Layer().setPosition(700, 400);
    var antag = new lime.Sprite().setFill(spriteSheet.getFrame('duelist.png'));
    target.appendChild(antag);

    scene.appendChild(protag);
    scene.appendChild(target);

    director.makeMobileWebAppCapable();

    //add some interaction
    goog.events.listen(target,['mousedown','touchstart'],function(e){

        //animate
        target.runAction(new lime.animation.Spawn(
            new lime.animation.FadeTo(.5).setDuration(.2),
            new lime.animation.ScaleTo(1.5).setDuration(.8)
        ));

        //let target follow the mouse/finger
        e.startDrag();

        //listen for end event
        e.swallow(['mouseup','touchend'],function(){
            target.runAction(new lime.animation.Spawn(
                new lime.animation.FadeTo(1),
                new lime.animation.ScaleTo(1),
                new lime.animation.MoveTo(512,384)
            ));
        });


    });

    // set current scene active
    director.replaceScene(scene);
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('duelists.start', duelists.start);

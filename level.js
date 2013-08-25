goog.provide('kchodorow.Level');
goog.provide('kchodorow.Levels');

var colorMap = 
    [
     // med blue
     {r: 2, g: 73, b: 89},
     // dark red
     {r: 191, g: 42, b: 42},
     // Cyan
     {r: 4, g: 146, b: 178}
     ]; 

kchodorow.Level = function(width, height, colors, opts) {
    this.width_ = width;
    this.height_ = height;
    this.colors_ = colors;

    if (!opts) {
	opts = {};
    }

    // 30px over 5 seconds
    this.dotVelocity_ = 'velocity' in opts? opts.velocity : .006;
    this.gunSpeed_ = 'gunSpeed' in opts? opts.gunSpeed : 1;
};

kchodorow.Level.prototype.getWidth = function() {
    return this.width_;
};

kchodorow.Level.prototype.getHeight = function() {
    return this.height_;
};

kchodorow.Level.prototype.getColor = function() {
    return colorMap[Math.floor(Math.random()*this.colors_)];
};

kchodorow.Level.prototype.getSeconds = function() {
    return 10;
};

kchodorow.Level.prototype.getDotVelocity = function() {
    return this.dotVelocity_;
}

kchodorow.Level.prototype.getGunSpeed = function() {
    return this.gunSpeed_;
}

// TODO: goal # of shots
kchodorow.Levels = 
    [
     new kchodorow.Level(6, 6, 2, {velocity: .003, gunSpeed: 3}),
     new kchodorow.Level(6, 6, 3, {velocity: .004, gunSpeed: 3}),
     new kchodorow.Level(5, 5, 3, {velocity: .005, gunSpeed: 2}),
     new kchodorow.Level(4, 4, 3),
     new kchodorow.Level(3, 3, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3, {gunSpeed: .8}),
     new kchodorow.Level(5, 5, 3, {gunSpeed: .5})
     ];

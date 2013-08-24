goog.provide('kchodorow.Level');
goog.provide('kchodorow.Levels');

var colorMap = 
    [
     // med blue
     {r: 2, g: 73, b: 89},
     // dark red
     {r: 191, g: 42, b: 42},
     // Cyan
     {r: 4, g: 146, b: 178},
     ]; 

kchodorow.Level = function(width, height, colors) {
    this.width_ = width;
    this.height_ = height;
    this.colors_ = colors;
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

kchodorow.Levels = 
    [
     new kchodorow.Level(3, 3, 2),
     new kchodorow.Level(4, 4, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     new kchodorow.Level(5, 5, 3),
     ];

goog.provide('kchodorow.Player');

kchodorow.Player = function(isPlayer) {
    this.reset();
    this.isPlayer_ = isPlayer;
};

kchodorow.Player.prototype.getDotCount = function() {
    return this.dotCount_;
};

kchodorow.Player.prototype.getColor = function() {
    return this.curColor_;
};

kchodorow.Player.prototype.isPlayer = function() {
    return this.isPlayer_;
};

kchodorow.Player.prototype.register = function(dot) {
    var color = dot.color;
    if (this.color == color) {
	this.dotCount_++;
    } else {
	dotCount_ = 1;
    }
    this.curColor_ = color;
    this.lastClick_ = new goog.math.Coordinate(dot.x, dot.y);
};

kchodorow.Player.prototype.getLastClick = function() {
    return this.lastClick_;
}

kchodorow.Player.prototype.reset = function() {
    this.curColor_ = null;
    this.dotCount_ = 0;
    this.lastClick_ = null;
};

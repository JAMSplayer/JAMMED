BreadToken = function(game, x, y, velocityX, velocityY) {
	this.hpValue = 3;

	// Create the sprite object
	Phaser.Sprite.call(this, game, x, y, 'bread-token');
	this.anchor.setTo(0.5, 0.5);
	this.animations.add('shimmer', Phaser.Animation.generateFrameNames('shimmer', 1, 5), 8, true);
	this.animations.play('shimmer');

	// Set some physics
	game.physics.arcade.enable(this);
	this.enableBody = true;
	this.body.bounce.y = 0;
	this.body.gravity.y = 0;
	this.body.gravity.x = 0;
	this.body.velocity.x = velocityX; // Vel X & Y set by BreadToken
	this.body.velocity.y = velocityY;
	//this.checkWorldBounds = true;
	this.events.onOutOfBounds.add(function() {
		this.autoDeath(game);
	}, this); // Autokill

	// Set collision body size
	// this.body.setSize(8, 8, 0, 0);

	// Add object to the game
	game.add.existing(this);

	// Add this to the collectibles group
	game.collectibles.add(this);

	//console.log('created BreadToken');
};

BreadToken.prototype = Object.create(Phaser.Sprite.prototype);
BreadToken.prototype.constructor = BreadToken;

BreadToken.prototype.update = function() {

	// Check for collisions with Jammy
	var _game = this.game;
    this.game.physics.arcade.overlap(this, this.game.jammy, function (BreadToken, jammy) {
    	_game.breadTokenCollectSound.play();
    	jammy.breadTokens++;
    	//console.log(jammy.breadTokens);
    	BreadToken.die();
    });

};

BreadToken.prototype.die = function(game) {
	this.kill();
	this.destroy();
}
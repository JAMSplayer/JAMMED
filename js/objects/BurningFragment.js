class BurningFragment extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, velocityX, velocityY) {
	  super(scene, x, y, 'burning-fragment');
	  // Set initial properties
	  this.invincible = true;
  
	  // Add fragment to scene and enable physics
	  scene.add.existing(this);
	  scene.physics.add.existing(this);
  
	  // Setup physics properties
	  this.body.setBounce(0);
	  this.body.setAllowGravity(false);
	  this.body.setVelocity(velocityX, velocityY); // Set initial velocity based on PineappleBomb input
	  this.body.setSize(8, 8);
  
	  // Animation for burning effect
	  this.anims.create({
		key: 'burn',
		frames: this.anims.generateFrameNames('burning-fragment', {
		  prefix: 'burn',
		  start: 1,
		  end: 2,
		}),
		frameRate: 4,
		repeat: -1,
	  });
	  this.play('burn');
  
  
	  // Add fragment to the enemy projectiles group
		  // Check collision with Jammy
		  this.scene.physics.add.overlap(this, this.scene.jammy.sprite, (frag, jammy) => {
			if (!jammy.parentObject.invincible) {
			  jammy.parentObject.takeDamage();
			}
		  }, null, this);
		
		this.autoDestoryTimer = scene.time.addEvent({
			delay: 2000,
			callback: this.destroy,
			callbackScope: this,
		});
	
		

		
	}
  
	
  
	die() {
	  this.destroy(); // Remove from the scene
	}
  }
  
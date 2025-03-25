class WatermelonSeed extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, velocityX, velocityY) {
    super(scene, x, y, "watermelon-seed");

    // Prevent Jammy from being able to shoot the enemy down
    this.invincible = true;

    // Add to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set anchor point
    this.setOrigin(0.5, 0.5);

    // Physics settings
    this.body.setBounce(0);
	  this.body.setAllowGravity(false);
	  this.body.setVelocity(velocityX, velocityY);
    this.setCollideWorldBounds(false);

    // Add this to the enemy projectiles group
    scene.enemyProjectiles.add(this);


    // Handle out-of-bounds behavior
    scene.physics.world.on("worldbounds", (body) => {
      if (body.gameObject === this) {
        this.die();
      }
    });
  }

  die() {
    this.destroy();
  }
}

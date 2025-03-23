class AudioWave  {
  constructor(scene, x, y, direction = 1, up=false, bigShot=false, velocity=500) {
    // Determine x spawn based on direction Jammy is facing
    const spawnX = direction === -1 ? x - 16 : x + 16;
    if(bigShot){
      this.damage=3;
    }
    // Call Phaser Sprite constructor
    this.sprite=scene.add.sprite( spawnX, y, "audio-wave");
    this.scene = scene;
    // Add the sprite to the scene and enable physics
    scene.physics.add.existing(this.sprite);
    scene.bullets.add(this.sprite);
    // Set anchor point to the center
    this.sprite.setOrigin(0.5, 0.5);

    // Flip the sprite if Jammy is facing left
    if (direction === 'left') {
      this.sprite.setFlipX(true);
      velocity = -velocity;
      if(up){
        this.sprite.angle = 45;
      }

    }
    else{
      if(up){
        this.sprite.angle = -45;
      }
    }

    // Set physics properties
    this.sprite.body.setBounce(0); // No bounce
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setSize(13, 15, true); // Adjust collision body size

    // Play laser sound
    scene.sound.play("laserSound");

    // Handle out of bounds auto-destroy
    //  this.sprite.body.onWorldBounds = true;
   

    // Set velocity for movement
    this.sprite.body.setVelocityX(velocity);
    if (up) {
        this.sprite.body.setVelocityY(-Math.abs(velocity));
      
    }

    // Check for collisions with enemies
    this.scene.physics.add.overlap(
      this.sprite,
      this.scene.enemies,
      (bullet, enemy) => {
        this.sprite.destroy();
        if (!enemy.invincible) {
          enemy.takeDamage(this.damage);
        }
      }
    );

    this.destructionCheck = scene.time.addEvent({
      delay: 50,
      callback: function () {
        if (
          this.sprite.x >
            this.scene.cameras.main.scrollX + this.scene.cameras.main.width ||
          this.sprite.x <
            this.scene.cameras.main.scrollX - this.scene.cameras.main.width / 9
        ) {
          this.autoDeath();
        }
      },
      callbackScope: this,
      repeat: -1,
    });

    if(bigShot){
      this.sprite.setScale(1.5);
    }

  }

  autoDeath() {
    console.log("dead");
    this.scene.bullets.remove(this.sprite);
    this.sprite.destroy();
    this.destructionCheck.destroy();
  }
}

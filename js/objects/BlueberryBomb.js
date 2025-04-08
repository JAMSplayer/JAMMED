class BlueberryBomb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "blueberry-bomb");

    // Add bomb to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Properties
    this.invincible = true;

    // Physics properties
    this.body.setBounce(0);
    this.body.setGravityY(600); // Apply gravity
    this.body.setVelocityX(0);
    this.body.setSize(6, 6); // Adjust collision size

    // Play sound
    scene.sound.play("blueberryBombDropSound");
    // Check for overlap with Jammy
    this.scene.physics.add.overlap(
      this,
      this.scene.jammy.sprite,
      (bomb, jammy) => {
        if (!jammy.invincible) {
          bomb.die();
          jammy.parentObject.takeDamage();
        }
      }
    );
  }

  update() {
    // Check if the bomb has hit the floor
    if (this.body.onFloor()) {
      // Play death animation or handle destruction
      this.die();
    }
  }

  die() {
    // Destroy the bomb
    this.destroy();
  }
}

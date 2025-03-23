class Blueberry extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Call Phaser 3 Sprite constructor
    super(scene, x, y, "blueberry");
    // Set basic character properties
    this.hp = 1;
    this.roamSpeed = 100;
    this.roaming = false;
    this.facing = -1;
    this.takingDamage = false;
    this.invincible = false;
    this.invincibilityTime = 50;
    this.awareDistance = 400;
    this.bombDropDelay = 60; // 1 second
    this.dead = false;
    this.score = 500;

    // Enable physics and body settings
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setBounce(0);
    this.body.setAllowGravity(false);
    this.body.setVelocity(0, 0);
    //this.setImmovable(true);
    this.body.setSize(14, 14, true); // Set collision body size

    // Add animations
    this.anims.create({
      key: "oscillating-right",
      frames: this.anims.generateFrameNames("blueberry", {
        prefix: "oscillating-right",
        start: 1,
        end: 8,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "oscillating-left",
      frames: this.anims.generateFrameNames("blueberry", {
        prefix: "oscillating-left",
        start: 1,
        end: 8,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.play("oscillating-left"); // Default animation

    // Add this enemy to the enemies group
    scene.enemies.add(this);

    this.roamTimer = scene.time.addEvent({
      delay: 100,
      callback: this.roam,
      callbackScope: this,
      repeat: -1,
    });

    this.bombTimer = scene.time.addEvent({
      delay: 1500,
      callback: function () {
        if (
          Phaser.Math.Distance.Between(
            this.x,
            this.y,
            scene.jammy.sprite.x,
            scene.jammy.sprite.y
          ) < this.awareDistance
        ) {
          this.dropBomb();
        }
      },
      callbackScope: this,
      repeat: -1,
    });
  }

  update() {
    if (!this.dead) {
      // Play the appropriate animation based on facing direction
      if (this.facing === 1) {
        this.play("oscillating-right", true);
      } else {
        this.play("oscillating-left", true);
      }

      if (this.body.blocked.left) {
        this.facing = 1;
      } else if (this.body.blocked.right) {
        this.facing = -1;
      }
    }
  }

  rest() {
    this.body.setVelocityX(0);
    this.play(
      this.facing === -1 ? "oscillating-left" : "oscillating-right",
      true
    );

    scene.time.delayedCall(
      500,
      () => {
        this.roaming = true;
      },
      [],
      this
    );
  }

  roam() {
    if (!this.dead) {
      if (
        Phaser.Math.Distance.Between(
          this.x,
          this.y,
          scene.jammy.sprite.x,
          scene.jammy.sprite.y
        ) < this.awareDistance &&
        this.roaming
      ) {
        if (this.x < scene.jammy.sprite.x) {
          this.facing = 1;
        }
        if (this.x > scene.jammy.sprite.x) {
          this.facing = -1;
        }
        this.body.setVelocityX(this.roamSpeed * this.facing);
       this.roaming = false;
      } else {
        this.rest();
      }
    }
  }

  dropBomb() {
    let bomb = new BlueberryBomb(this.scene, this.x, this.y + 8);
    this.scene.enemies.add(bomb);
  }

  takeDamage() {
    this.hp--;
    this.takingDamage = true;
    this.flashOnce();
    this.invincible = true;
    this.scene.time.delayedCall(
      this.invincibilityTime,
      this.restoreVulnerability,
      [],
      this
    );
    this.scene.time.delayedCall(
      this.invincibilityTime,
      this.toggleTakingDamage,
      [],
      this
    );
    this.invincibilityLoop = this.scene.time.addEvent({
      delay: 100,
      callback: this.blinkInvincible,
      callbackScope: this,
      loop: true,
    });
    this.scene.sound.play("enemyHitSound");
    if (this.hp <= 0) {
      this.die();
    }
  }

  flashOnce() {
    this.setTint(0x0000ff);
    this.scene.time.delayedCall(
      50,
      () => {
        this.clearTint();
      },
      [],
      this
    );
  }

  blinkInvincible() {
    this.setAlpha(0);
    this.scene.time.delayedCall(25, this.restoreAlpha, [], this);
  }

  restoreAlpha() {
    this.setAlpha(1);
  }

  restoreVulnerability() {
    this.scene.time.removeEvent(this.invincibilityLoop);
    this.restoreAlpha();
    this.clearTint();
    this.invincible = false;
    this.takingDamage = false;
  }

  toggleTakingDamage() {
    this.takingDamage = !this.takingDamage;
  }

  die() {
    this.dead = true;
    scene.scene.get("UIScene").setScore(this.score);
    this.body.setEnable(false);
    this.roamTimer.destroy();
    this.bombTimer.destroy();
    this.play("death").on("animationcomplete-death", () => {
      this.destroy();
    });
  }
}

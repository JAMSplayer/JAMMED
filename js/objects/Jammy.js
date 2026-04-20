class Jammy {
  constructor(x, y, hp = 5, facing = "right") {
    this.bulletLimit = 3;
    this.maxHP = 5;
    this.hp = hp ? hp : this.maxHP;
    this.walkSpeed = 125;
    this.invincible = false;
    this.invincibiltyTime = 500;
    this.takingDamage = false;
    this.hitDirection;
    this.hitHisHead = false;
    this.canAttack = true;
    this.falling = false;
    this.jumping = false;
    this.canDoubleJump = false;
    this.canJump = false;
    this.jumpTimer = 0;
    this.jumpHoldTime = 160;
    this.jumpVelocity = -300;
    this.facing = facing ? facing : "right";
    this.antTokens = 0;
    this.currentWeapon = "sonic";
    this.availableWeapons = ["sonic", "seed"];
    this.seedCooldownMs = 320;
    this.lastSeedTime = 0;
    this.seedAmmo = 1;
    this.seedAmmoMax = 12;
    this.lastDryClickTime = 0;
    this.controlsEnabled = true;
    this.alive = true;
    this.walkingLeft = false;
    this.walkingRight = false;
    this.wasWalking = false;
    this.jumpSound = scene.sound.add("jumpSound");
    this.leftIsDown = false;
    this.rightIsDown = false;
    this.up = false;

    this.gamepad = new VirtualGamepad(scene);

    this.sprite = scene.physics.add.sprite(x, y, "jammy", "resting-right2");

    this.sprite.play("resting-right");
    this.sprite.parentObject = this;

    // Set some physics for Jammy

    //this.sprite.body.collideWorldBounds = true;

    // Set collision body size
    this.sprite.body.setSize(18, 28);

    // Add attack button
    this.attackButton = scene.input.keyboard.addKey(controls.shoot);
    //this.attackButton.onDown.add(this.fireAudioWave, this);

    // Add jump button

    this.leftButton = scene.input.keyboard.addKey(controls.left);
    this.rightButton = scene.input.keyboard.addKey(controls.right);
    this.jumpButton = scene.input.keyboard.addKey(controls.jump);
    this.aimButton = scene.input.keyboard.addKey(controls.aim);
    this.secondaryAimButton = scene.input.keyboard.addKey(
      controls.secondaryAim
    );
this.secondaryShootButton = scene.input.keyboard.addKey(controls.secondaryShoot);
    scene.input.keyboard.addCapture(controls.cycleWeapon);
    this.cycleWeaponButton = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[controls.cycleWeapon] || controls.cycleWeapon
    );
    this.cycleWeaponButton.on(
      "down",
      function () {
        if (!this.alive || !this.controlsEnabled) return;
        if (this.availableWeapons.length <= 1) return;
        const i = this.availableWeapons.indexOf(this.currentWeapon);
        this.currentWeapon = this.availableWeapons[(i + 1) % this.availableWeapons.length];
        const ui = scene.scene.get("UIScene");
        if (ui && ui.setWeapon) ui.setWeapon(this.currentWeapon);
      },
      this
    );
    this.aimButton.on(
      "down",
      function () {
        this.up = true;
      },
      this
    );

    this.aimButton.on(
      "up",
      function () {
        this.up = false;
      },
      this
    );

    this.secondaryAimButton.on(
      "down",
      function () {
        this.up = true;
      },
      this
    );

    this.secondaryAimButton.on(
      "up",

      function () {
        this.up = false;
      },
      this
    );

    this.leftButton.on(
      "down",
      function (event) {
        if (this.alive) {
          this.leftIsDown = true;
          this.walkingLeft = true;

          this.facing = "left";

          this.move(this.facing);
        }
      },
      this
    );

    this.rightButton.on(
      "down",
      function (event) {
        if (this.alive) {
          this.rightIsDown = true;
          this.walkingRight = true;
          this.facing = "right";
          this.move(this.facing);
        }
      },
      this
    );

    this.leftButton.on(
      "up",
      function (event) {
        this.leftIsDown = false;
        this.walkingLeft = false;
        this.wasWalking = false;
        if (!this.jumping && !this.falling) {
          this.rest();
        }
      },
      this
    );

    this.rightButton.on(
      "up",
      function (event) {
        this.rightIsDown = false;
        this.walkingRight = false;
        this.wasWalking = false;
        if (!this.jumping && !this.falling) {
          this.rest();
        }
      },
      this
    );

    this.jumpButton.on(
      "down",
      function (event) {
        if (this.alive) {
          this.jump();
        }
      },
      this
    );

    this.attackButton.on(
      "down",
      function () {
        if (this.alive) {
          this.shoot();
        }
      },
      this
    );

  

    this.attackButton.on("up", function () {}, this);

    this.secondaryShootButton.on(
      "down",
      function () {
        if (this.alive) {
          this.shoot();
        }
      },
      this
    );

    this.secondaryShootButton.on("up", function () { }, this);
    


    this.gamepad.gamepad.touchCursor.cursorKeys.up.on(
      "down",
      function (event) {
        this.aimButton.emit("down");
      },
      this
    );

    this.gamepad.gamepad.touchCursor.cursorKeys.up.on(
      "up",
      function (event) {
        this.aimButton.emit("up");
      },
      this
    );

    this.gamepad.gamepad.touchCursor.cursorKeys.left.on(
      "down",
      function (event) {
        this.leftButton.emit("down");
      },
      this
    );

    this.gamepad.gamepad.touchCursor.cursorKeys.right.on(
      "down",
      function (event) {
        this.rightButton.emit("down");
      },
      this
    );

    this.gamepad.gamepad.touchCursor.cursorKeys.left.on(
      "up",
      function (event) {
        this.leftButton.emit("up");
      },
      this
    );

    this.gamepad.gamepad.touchCursor.cursorKeys.right.on(
      "up",
      function (event) {
        this.rightButton.emit("up");
      },
      this
    );

    this.gamepad.gamepad.touchCursor.cursorKeys.up.on(
      "up",
      function (event) {
        this.up = false;
      },
      this
    );
    this.gamepad.xButton.on(
      "pointerdown",
      function () {
        this.jumpButton.emit("down");
      },
      this
    );

    this.gamepad.xButton.on(
      "pointerup",
      function () {
        this.jumpButton.emit("up");
      },
      this
    );

    this.gamepad.zButton.on(
      "pointerdown",
      function () {
        this.attackButton.emit("down");
      },
      this
    );

    this.gamepad.zButton.on(
      "pointerup",
      function () {
        this.attackButton.emit("up");
      },
      this
    );
    scene.input.addPointer(3);
  }

  update() {
    if (this.alive) {
      if(this.leftIsDown){this.sprite.body.setVelocityX(-this.walkSpeed);}
      if(this.rightIsDown){this.sprite.body.setVelocityX(this.walkSpeed);}
      if (
        !this.falling &&
        !this.jumping &&
        !this.walkingLeft &&
        !this.walkingRight &&
        !this.wasWalking &&
        !this.shootingPoseActive &&
        (this.sprite.body.touching.down || this.sprite.body.blocked.down)
      ) {
        this.rest();
      } else {
        if (
          (this.sprite.body.touching.down || this.sprite.body.blocked.down) &&
          (this.leftIsDown || this.rightIsDown)
        ) {
          this.move(this.facing);
        }
      }

      if (
        (this.sprite.body.touching.down || this.sprite.body.blocked.down) &&
        this.sprite.body.velocity.y >= 0
      ) {
        this.canDoubleJump = false;
        this.jumping = false;
        this.falling = false;
      }

      // Disable controls when taking damage and move Jammy slowly in
      // direction of damage taken
      if (this.takingDamage) {
        this.controlsEnabled = false;

        // Move Jammy slowly
        var movement = this.hitDirection == 1 ? -10 : 10;
        this.sprite.body.velocity.x = movement;

        // Play damage animation
        if (this.facing == "right") {
          this.sprite.play("taking-damage-right");
        } else {
          this.sprite.play("taking-damage-left");
        }
      }

      // Controls
    }
    else {
      this.sprite.body.setVelocityX(0);
    }

  }
  shoot() {
    if (this.currentWeapon === "seed") {
      this.fireSeed();
    } else {
      this.fireSonic();
    }
    this.playShootingPose();
  }

  playShootingPose() {
    // Angry standing-still-firing sprite — only while stationary
    const stationary =
      !this.walkingLeft &&
      !this.walkingRight &&
      !this.jumping &&
      !this.falling &&
      (this.sprite.body.touching.down || this.sprite.body.blocked.down);
    if (!stationary) return;
    const anim = this.facing === "right" ? "shooting-right" : "shooting-left";
    this.shootingPoseActive = true;
    this.sprite.play(anim, true);
    // Up-aim needs its own sprite frame to look right — the atlas
    // doesn't have one yet, so no tilt. Left as-is until we have
    // shooting-up-right/left frames in jammy.json.
    if (this._shootPoseTimer) this._shootPoseTimer.remove(false);
    this._shootPoseTimer = scene.time.delayedCall(320, () => {
      this.shootingPoseActive = false;
      if (!this.alive) return;
      if (
        !this.walkingLeft &&
        !this.walkingRight &&
        !this.jumping &&
        !this.falling
      ) {
        this.rest();
      }
    });
  }

  fireSonic() {
    if (scene.bullets.getChildren().length < this.bulletLimit) {
      if (this.facing == "right") {
        let audiowave = new AudioWave(
          scene,
          this.sprite.x,
          this.sprite.y + 5,
          this.facing,
          this.up,
          this.bigShot
        );
      } else {
        let audiowave = new AudioWave(
          scene,
          this.sprite.x - this.sprite.width,
          this.sprite.y + 5,
          this.facing,
          this.up,
          this.bigShot
        );
      }
    }
    if (this.bigShot) {
      this.bigShot = false;
      this.sprite.setTint(0xffffff);
      this.sprite.setPipeline("Electric");
      scene.time.delayedCall(
        500,
        function () {
          this.sprite.resetPipeline();
        },
        [],
        this
      );
    }
  }

  fireSeed() {
    const now = scene.time.now;
    if (now - this.lastSeedTime < this.seedCooldownMs) return;
    if (this.seedAmmo <= 0) {
      // Dry-fire click — throttled so it doesn't machine-gun
      if (now - this.lastDryClickTime > 180) {
        this.lastDryClickTime = now;
        scene.sound.play("enemyHitSound", { volume: 0.1, rate: 0.35 });
      }
      return;
    }
    this.lastSeedTime = now;
    this.seedAmmo -= 1;
    const spawnX = this.facing === "right" ? this.sprite.x + 8 : this.sprite.x - 8;
    new SeedOfDestruction(scene, spawnX, this.sprite.y, this.facing, this.up);
    if (SeedOfDestruction.playFireSound) SeedOfDestruction.playFireSound(scene);
    const ui = scene.scene.get("UIScene");
    if (ui && ui.setSeedAmmo) ui.setSeedAmmo(this.seedAmmo);
  }

  addSeedAmmo(n) {
    this.seedAmmo = Math.min(this.seedAmmoMax, this.seedAmmo + n);
    const ui = scene.scene.get("UIScene");
    if (ui && ui.setSeedAmmo) ui.setSeedAmmo(this.seedAmmo);
  }

  move(direction) {
    if (this.alive) {
      if (direction == "right") {
        this.walkingRight = true;
      } else {
        this.walkingLeft = true;
      }
      this.wasWalking = true;
      if (direction == "right") {
        this.sprite.body.velocity.x = this.walkSpeed;
        this.sprite.body.setSize(18, 28, 8, 4);

        this.sprite.play("running-right", true);
      } else if (direction == "left") {
        this.sprite.body.velocity.x = -this.walkSpeed;
        this.sprite.body.setSize(18, 28, 8, 4);

        this.sprite.play("running-left", true);
      }
    }
  }

  rest() {
    if (this.alive) {
      if (!this.leftIsDown && !this.rightIsDown) {
        this.sprite.body.velocity.x = 0;
      }
      if (this.facing == "right") {
        this.sprite.play("resting-right", true);
        this.sprite.body.setSize(18, 28, 8, 4);
      } else {
        this.sprite.play("resting-left", true);
        this.sprite.body.setSize(18, 28, 8, 4);
      }
    }
  }

  jump() {
    if (
      (this.sprite.body.touching.down || this.sprite.body.blocked.down) &&
      !this.canDoubleJump
    ) {
      this.sprite.body.velocity.y = this.jumpVelocity;
      this.jumping = true;
      this.falling = false;
      this.walkingLeft = false;
      this.walkingRight = false;
      if (!this.jumpSound.isPlaying) {
        // Prevent rapid jump sounds
        this.jumpSound.play();
      }

      this.canDoubleJump = true;
    } else if (this.canDoubleJump) {
      // Rocket Axe — Jammy kicks off his guitar and the boosters
      // fire, propelling him up and forward in a long arc.
      this._rocketAxeBoost();
      this.canDoubleJump = false;
    }
    if (this.facing == "right") {
      this.sprite.play("jumping-right", true);
    } else {
      this.sprite.play("jumping-left", true);
    }
  }

  _rocketAxeBoost() {
    const dirX = this.facing === "right" ? 1 : -1;
    // Strong vertical kick + horizontal thrust — creates a long
    // airborne arc rather than a second hop.
    this.sprite.body.velocity.y = -560;
    this.sprite.body.velocity.x = dirX * 300;
    this.jumping = true;
    this.falling = false;

    const s = scene;

    // Rocket-Axe guitar — Jammy rides it during the boost.
    Jammy._ensureRocketAxeTexture(s);
    if (this._axeSprite) this._axeSprite.destroy();
    this._axeSprite = s.add.sprite(this.sprite.x, this.sprite.y + 12, "rocket-axe");
    this._axeSprite.setFlipX(dirX === -1);
    this._axeSprite.setDepth(99);
    // Small wobble rotation so it reads as a rocket ride
    s.tweens.add({
      targets: this._axeSprite,
      angle: dirX * 8,
      yoyo: true,
      repeat: 3,
      duration: 140,
      ease: "Sine.easeInOut",
    });

    // Flame exhaust out the tail-end of the guitar body
    if (this._rocketFlameTimer) this._rocketFlameTimer.remove(false);
    const boostMs = 520;
    this._rocketFlameTimer = s.time.addEvent({
      delay: 24,
      repeat: Math.floor(boostMs / 24),
      callback: () => {
        if (!this._axeSprite || !this._axeSprite.active) return;
        // Tail is on the opposite side of facing
        const tailX = this._axeSprite.x + (dirX === 1 ? -18 : 18);
        const tailY = this._axeSprite.y + 2;
        const flame = s.add.circle(
          tailX + (Math.random() - 0.5) * 4,
          tailY + (Math.random() - 0.5) * 3,
          3 + Math.random() * 2,
          Math.random() < 0.5 ? 0xff5a20 : 0xffd060,
          0.9
        );
        flame.setDepth(98);
        s.tweens.add({
          targets: flame,
          x: tailX - dirX * 14,
          y: tailY + 6,
          alpha: 0,
          scale: 0.3,
          duration: 320,
          ease: "Cubic.easeOut",
          onComplete: () => flame.destroy(),
        });
      },
    });

    // Keep the guitar under Jammy's feet for the boost duration,
    // then fade it out (he "kicks off" it as gravity retakes).
    if (this._rocketFollowTimer) this._rocketFollowTimer.remove(false);
    this._rocketFollowTimer = s.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (!this._axeSprite || !this.sprite || !this.sprite.active) return;
        this._axeSprite.x = this.sprite.x;
        this._axeSprite.y = this.sprite.y + 12;
      },
    });
    s.time.delayedCall(boostMs, () => {
      if (this._rocketFollowTimer) { this._rocketFollowTimer.remove(false); this._rocketFollowTimer = null; }
      if (this._axeSprite) {
        const axe = this._axeSprite;
        this._axeSprite = null;
        s.tweens.add({
          targets: axe,
          alpha: 0,
          y: axe.y + 10,
          angle: axe.angle + dirX * 40,
          duration: 220,
          ease: "Cubic.easeIn",
          onComplete: () => axe.destroy(),
        });
      }
    });

    // Launch sfx
    if (s.cache.audio.exists("laserSound")) {
      s.sound.play("laserSound", { volume: 1.0, rate: 0.55 });
    }
    if (s.cache.audio.exists("shortExplosion")) {
      s.time.delayedCall(70, () => {
        if (s.cache && s.cache.audio.exists("shortExplosion")) {
          s.sound.play("shortExplosion", { volume: 0.55, rate: 0.9 });
        }
      });
    }
  }

  static _ensureRocketAxeTexture(scene) {
    if (scene.textures.exists("rocket-axe")) return;
    // 44x18 Flying-V guitar: red wings, wooden neck, headstock, strings.
    // Oriented pointy-end RIGHT (neck on the right). flipX for left.
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    // Body — red V wings
    g.fillStyle(0xc03020, 1);
    // Upper wing triangle
    g.fillTriangle(0, 0, 20, 9, 0, 8);
    // Lower wing triangle
    g.fillTriangle(0, 18, 20, 9, 0, 10);
    // Filled center so the V looks like a solid body
    g.fillRect(0, 6, 22, 6);
    // Outline
    g.lineStyle(1, 0x6a1a10, 1);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(22, 9);
    g.lineTo(0, 18);
    g.closePath();
    g.strokePath();
    // Pickup — dark rectangle on the body
    g.fillStyle(0x181818, 1);
    g.fillRect(12, 7, 5, 4);
    // Neck
    g.fillStyle(0x5a3a1e, 1);
    g.fillRect(22, 7, 16, 4);
    g.lineStyle(1, 0x2e1a08, 1);
    g.strokeRect(22, 7, 16, 4);
    // Frets
    g.lineStyle(0.6, 0x2e1a08, 1);
    for (let fx = 25; fx < 38; fx += 3) {
      g.lineBetween(fx, 7, fx, 11);
    }
    // Headstock
    g.fillStyle(0x3a240e, 1);
    g.fillRect(38, 5, 6, 8);
    // Tuning pegs
    g.fillStyle(0xd0d0d0, 1);
    g.fillCircle(40, 6, 0.9);
    g.fillCircle(42, 6, 0.9);
    g.fillCircle(40, 12, 0.9);
    g.fillCircle(42, 12, 0.9);
    // Strings
    g.lineStyle(0.5, 0xdcdcdc, 0.85);
    g.lineBetween(4, 8, 38, 8);
    g.lineBetween(4, 10, 38, 10);
    g.generateTexture("rocket-axe", 44, 18);
    g.destroy();
  }

  powerUp(type, val = 0) {
    switch (type) {
      case "heal":
        this.hp += val;
        if (this.hp > this.maxHP) {
          this.hp = this.maxHP;
        }
        break;
      case "bigShot":
        this.bigShot = true;
        this.sprite.setTint(0x0000f5);
        this.sprite.setPipeline("Electric2");
        break;
    }
    // Play power up sound
    scene.sound.play("powerUpSound");
  }

  takeDamage() {
    if (this.alive && !this.invincible) {
      this.controlsEnabled = false;
      this.hp--;

      // Blubert feels it too — companion flashes/recoils in sympathy
      if (scene.blubert && scene.blubert.takeSympathyDamage) {
        scene.blubert.takeSympathyDamage();
      }

      this.takingDamage = true;
      this.flashOnce();
      this.invincible = true;
      this.sprite.scene.time.addEvent({
        delay: this.invincibiltyTime,
        callback: this.restoreVulnerability,
        callbackScope: this,
      }); // Invicibility delay
      this.sprite.scene.time.addEvent({
        delay: 500,
        callback: function () {
          this.takingDamage = false;
          this.controlsEnabled = true;
          if (this.hp <= 0) {
            this.die();
          }
        },
        callbackScope: this,
      });
      this.invincibilityLoop = this.sprite.scene.time.addEvent({
        delay: 100,
        callback: this.blinkInvincible,
        callbackScope: this,
      });
      this.sprite.scene.sound.play("jammyTakeDamageSound");
    }
  }

  // Flash Red when taking damage
  flashOnce(tint) {
    this.sprite.tint = tint ? tint : 0xff0000;
    this.sprite.scene.time.addEvent({
      delay: 50,
      callback: function () {
        this.restoreAlpha();
        this.removeTint();
      },
      callbackScope: this,
    });
  }

  // Blink to show invincibility
  blinkInvincible() {
    this.sprite.alpha = 0;
    this.sprite.scene.time.addEvent({
      delay: 25,
      callback: this.restoreAlpha,
      callbackScope: this,
    });
  }

  restoreAlpha() {
    this.sprite.alpha = 1;
  }

  removeTint() {
    this.sprite.tint = 0xffffff;
  }

  restoreVulnerability() {
    this.restoreAlpha();
    this.removeTint();
    this.invincible = false;
    this.takingDamage = false;
  }

  die = function () {
    // Make sure user cannot move
    this.controlsEnabled = false;

    // Stop the music

    this.sprite.scene.sound.stopAll();

    // Clear persisting Jammy Data
    this.sprite.scene.jammyData = null;

    // Kill Jammy and show death animation
    this.alive = false;

    // Play death sound
    this.sprite.scene.sound.play("jammyDeathSound");
    this.sprite.body.setSize(this.sprite.width / 6, this.sprite.width / 6);
    if (this.facing == "right") {
      this.sprite.play("dead-right");
    } else {
      this.sprite.play("dead-left");
    }
    // Reset scene after short delay
    this.sprite.scene.time.addEvent({
      delay: 1000,
      callback: function () {
        //this.destroy();
        this.sprite.scene.scene.restart();
      },
      callbackScope: this,
    });
  };

  instantDeath() {
    this.hp = 0;
    this.die();
  }
}

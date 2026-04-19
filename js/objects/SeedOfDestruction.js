class SeedOfDestruction extends Phaser.Physics.Arcade.Sprite {
  constructor(scn, x, y, direction, aimUp = false) {
    super(scn, x, y, "seed-of-destruction", "seed1");
    scn.add.existing(this);
    scn.physics.add.existing(this);

    this.body.setAllowGravity(true);
    this.body.setSize(10, 12, 3, 2);
    this.body.setBounce(0.25);

    this.damage = 3;
    this.blastRadius = 56;
    this.selfDamageRadius = 34;
    this.fuseMs = 1500;
    this.exploded = false;

    // Arc launch — direction -1 (left) / 1 (right); aimUp lobs higher and closer
    const dir = direction === "left" ? -1 : 1;
    const speedX = (aimUp ? 110 : 190) * dir;
    const speedY = aimUp ? -320 : -230;
    this.body.setVelocityX(speedX);
    this.body.setVelocityY(speedY);

    if (!scn.anims.exists("seed-spin")) {
      scn.anims.create({
        key: "seed-spin",
        frames: scn.anims.generateFrameNames("seed-of-destruction", { prefix: "seed", start: 1, end: 4 }),
        frameRate: 14, repeat: -1,
      });
    }
    this.play("seed-spin");

    this.fuseTimer = scn.time.delayedCall(this.fuseMs, () => this.explode());
    if (scn.groundLayer) {
      this.groundCollider = scn.physics.add.collider(this, scn.groundLayer, () => this.explode());
    }

    if (!scn.seedsOfDestruction) {
      scn.seedsOfDestruction = scn.physics.add.group();
    }
    scn.seedsOfDestruction.add(this);
  }

  explode() {
    if (this.exploded) return;
    this.exploded = true;
    if (this.fuseTimer) this.fuseTimer.remove(false);

    // Damage all enemies in blast radius
    if (this.scene.enemies) {
      for (const e of this.scene.enemies.getChildren()) {
        if (!e || e.dead) continue;
        const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
        if (d > this.blastRadius) continue;
        if (e.hidden && typeof e.explodeInBush === "function") {
          e.explodeInBush();
        } else if (typeof e.takeDamage === "function") {
          e.takeDamage(this.damage);
        }
      }
    }

    // Jammy self-damage if too close
    const jammy = this.scene.jammy;
    if (jammy && jammy.alive) {
      const dj = Phaser.Math.Distance.Between(this.x, this.y, jammy.sprite.x, jammy.sprite.y);
      if (dj <= this.selfDamageRadius) jammy.takeDamage();
    }

    // Stun Blubert if in range
    const blu = this.scene.blubert;
    if (blu && blu.sprite && !blu.stunned) {
      const db = Phaser.Math.Distance.Between(this.x, this.y, blu.sprite.x, blu.sprite.y);
      if (db <= this.selfDamageRadius) blu.stun();
    }

    // Visual: reuse enemy-death burst if available
    if (this.scene.anims.exists("enemy-death")) {
      const blast = this.scene.add.sprite(this.x, this.y, "enemy-death");
      blast.setScale(2);
      blast.play("enemy-death");
      blast.once("animationcomplete", () => blast.destroy());
    }
    this.scene.sound.play("enemyDeathSound");
    this.destroy();
  }
}

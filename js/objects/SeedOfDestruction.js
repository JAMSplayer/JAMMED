class SeedOfDestruction extends Phaser.Physics.Arcade.Sprite {
  constructor(scn, x, y, direction, aimUp = false) {
    SeedOfDestruction.ensureTexture(scn);
    super(scn, x, y, "seed-teardrop");
    scn.add.existing(this);
    scn.physics.add.existing(this);

    this.body.setAllowGravity(true);
    this.body.setSize(12, 8, 2, 1);
    this.body.setBounce(0.2);

    this.damage = 3;
    this.blastRadius = 56;
    this.selfDamageRadius = 34;
    this.fuseMs = 2200;
    this.exploded = false;

    // Arc launch — direction -1 (left) / 1 (right); aimUp lobs higher and closer
    const dir = direction === "left" ? -1 : 1;
    const speedX = (aimUp ? 170 : 300) * dir;
    const speedY = aimUp ? -520 : -380;
    this.body.setVelocityX(speedX);
    this.body.setVelocityY(speedY);

    // Fat end points the direction of travel
    this.setOrigin(0.5, 0.5);

    this.fuseTimer = scn.time.delayedCall(this.fuseMs, () => this.explode());
    // Explode on any solid tilemap contact — ground, walls, death blocks, etc.
    const blockingLayers = [
      scn.groundLayer,
      scn.enemyStopBlocksLayer,
      scn.deathBlocksLayer,
      scn.sceneChangeLayer,
    ].filter(Boolean);
    for (const layer of blockingLayers) {
      scn.physics.add.collider(this, layer, () => this.explode());
    }
    // Detonate on enemy contact too
    if (scn.enemies) {
      this.enemyOverlap = scn.physics.add.overlap(this, scn.enemies, () => this.explode());
    }

    // If we spawned already overlapping an enemy (point-blank shot),
    // detonate immediately on the next tick — damaging Jammy and
    // stunning Blubert in the process because the seed is still
    // inside the self-damage radius.
    if (scn.enemies) {
      const pbEnemy = scn.enemies.getChildren().find(e =>
        e && !e.dead &&
        Phaser.Math.Distance.Between(x, y, e.x, e.y) <= 18
      );
      if (pbEnemy) {
        scn.time.delayedCall(0, () => this.explode());
      }
    }

    if (!scn.seedsOfDestruction) {
      scn.seedsOfDestruction = scn.physics.add.group();
    }
    scn.seedsOfDestruction.add(this);
  }

  static ensureTexture(scene) {
    if (scene.textures.exists("seed-teardrop")) return;
    // 18x10 tan tear-drop with the fat end on the right.
    // Rotation at render time aims the fat end toward travel direction.
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xd4a676, 1);        // tan body
    g.fillEllipse(12, 5, 12, 10);    // fat end
    g.fillTriangle(12, 0, 12, 10, 0, 5); // tapered point
    g.lineStyle(1, 0x7e5a34, 1);     // darker outline
    g.strokeEllipse(12, 5, 12, 10);
    g.beginPath();
    g.moveTo(12, 0);
    g.lineTo(0, 5);
    g.lineTo(12, 10);
    g.closePath();
    g.strokePath();
    // Tiny highlight for form
    g.fillStyle(0xf0c899, 1);
    g.fillEllipse(13, 3, 4, 2);
    g.generateTexture("seed-teardrop", 18, 10);
    g.destroy();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.exploded || !this.body) return;
    // Rotate so the fat end always leads the velocity vector.
    const vx = this.body.velocity.x;
    const vy = this.body.velocity.y;
    if (vx !== 0 || vy !== 0) {
      this.rotation = Math.atan2(vy, vx);
    }
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

    // Visual: expanding shockwave ring + yellow flash + enemy-death burst
    const ring = this.scene.add.circle(this.x, this.y, this.blastRadius, 0xffee88, 0.35);
    ring.setStrokeStyle(3, 0xffffff, 1);
    ring.setScale(0.15);
    ring.setDepth(90);
    this.scene.tweens.add({
      targets: ring,
      scale: 1.2,
      alpha: 0,
      duration: 320,
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy(),
    });
    const flash = this.scene.add.circle(this.x, this.y, 18, 0xffffff, 0.8);
    flash.setDepth(91);
    this.scene.tweens.add({
      targets: flash,
      scale: 2.2,
      alpha: 0,
      duration: 180,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy(),
    });
    if (this.scene.anims.exists("enemy-death")) {
      const blast = this.scene.add.sprite(this.x, this.y, "enemy-death");
      blast.setScale(2.6);
      blast.setDepth(92);
      blast.play("enemy-death");
      blast.once("animationcomplete", () => blast.destroy());
    }
    this.scene.cameras.main.shake(120, 0.004);
    this.scene.sound.play("enemyDeathSound");
    this.destroy();
  }
}

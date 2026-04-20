// Jammy's upgraded weapon — a guitar-axe with rockets strapped on.
// Flies fast and flat with a flame trail, spins mid-flight, and
// explodes in a big radius on impact. Placeholder visuals generated
// at runtime until proper sprite art lands.
class RocketAxe extends Phaser.Physics.Arcade.Sprite {
  constructor(scn, x, y, direction) {
    RocketAxe.ensureTexture(scn);
    super(scn, x, y, "rocket-axe");
    scn.add.existing(this);
    scn.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setSize(16, 10, 5, 3);

    this.damage = 6;
    this.speed = 540;
    this.blastRadius = 84;
    this.lifetimeMs = 2500;
    this.exploded = false;

    const dir = direction === "left" ? -1 : 1;
    this.setFlipX(dir === -1);
    this.body.setVelocityX(this.speed * dir);

    // Continuous spin so the axe reads as flying blade
    this._spinTween = scn.tweens.add({
      targets: this,
      angle: dir === 1 ? 360 : -360,
      duration: 200,
      repeat: -1,
    });

    // Flame-trail emitter
    this._flameTimer = scn.time.addEvent({
      delay: 28,
      loop: true,
      callback: () => this._emitFlame(),
    });

    this.fuseTimer = scn.time.delayedCall(this.lifetimeMs, () => this.explode());

    const blockingLayers = [
      scn.groundLayer,
      scn.enemyStopBlocksLayer,
      scn.deathBlocksLayer,
      scn.sceneChangeLayer,
    ].filter(Boolean);
    for (const layer of blockingLayers) {
      scn.physics.add.collider(this, layer, () => this.explode());
    }
    if (scn.enemies) {
      this.enemyOverlap = scn.physics.add.overlap(this, scn.enemies, () => this.explode());
    }

    // Launch sound
    if (scn.sound && scn.cache && scn.cache.audio && scn.cache.audio.exists("laserSound")) {
      scn.sound.play("laserSound", { volume: 1.0, rate: 0.55 });
    }
  }

  static ensureTexture(scene) {
    if (scene.textures.exists("rocket-axe")) return;
    // 30x14 canvas: flame (left) + handle + blade (right)
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    // Flame exhaust tail
    g.fillStyle(0xff6a20, 1);
    g.fillTriangle(0, 6, 6, 2, 6, 11);
    g.fillStyle(0xffd060, 1);
    g.fillTriangle(2, 6, 7, 4, 7, 9);
    // Handle (wooden)
    g.fillStyle(0x7a4f2b, 1);
    g.fillRect(6, 6, 14, 2);
    g.lineStyle(1, 0x4a2e16, 1);
    g.strokeRect(6, 6, 14, 2);
    // Blade head (metal triangle)
    g.fillStyle(0xc8ccd6, 1);
    g.fillTriangle(20, 1, 30, 7, 20, 13);
    g.lineStyle(1, 0x5a5e6a, 1);
    g.strokeTriangle(20, 1, 30, 7, 20, 13);
    // Bolt on blade
    g.fillStyle(0x404650, 1);
    g.fillCircle(22, 7, 1.2);
    g.generateTexture("rocket-axe", 30, 14);
    g.destroy();
  }

  _emitFlame() {
    if (this.exploded || !this.body) return;
    const dir = this.body.velocity.x < 0 ? 1 : -1;
    const flame = this.scene.add.circle(
      this.x + dir * 12,
      this.y + (Math.random() - 0.5) * 5,
      3 + Math.random() * 2,
      Math.random() < 0.5 ? 0xff7020 : 0xffcf50,
      0.85
    );
    flame.setDepth((this.depth || 0) - 1);
    this.scene.tweens.add({
      targets: flame,
      alpha: 0,
      scale: 0.35,
      duration: 280,
      ease: "Cubic.easeOut",
      onComplete: () => flame.destroy(),
    });
  }

  explode() {
    if (this.exploded) return;
    this.exploded = true;
    if (this.fuseTimer) this.fuseTimer.remove(false);
    if (this._flameTimer) this._flameTimer.remove(false);
    if (this._spinTween) this._spinTween.remove();

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

    // Big fiery ring
    const ring = this.scene.add.circle(this.x, this.y, this.blastRadius, 0xff4410, 0.45);
    ring.setStrokeStyle(4, 0xffaa33, 1);
    ring.setScale(0.15);
    ring.setDepth(90);
    this.scene.tweens.add({
      targets: ring, scale: 1.25, alpha: 0,
      duration: 380, ease: "Cubic.easeOut",
      onComplete: () => ring.destroy(),
    });
    // White core flash
    const core = this.scene.add.circle(this.x, this.y, 20, 0xffffff, 0.9);
    core.setDepth(92);
    this.scene.tweens.add({
      targets: core, scale: 2.4, alpha: 0,
      duration: 220, ease: "Quad.easeOut",
      onComplete: () => core.destroy(),
    });
    // Fire sparks
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 + Math.random() * 0.35;
      const dist = 30 + Math.random() * this.blastRadius;
      const spark = this.scene.add.circle(
        this.x, this.y,
        2 + Math.random() * 2,
        [0xff3322, 0xff6611, 0xffaa33, 0xffee66][i % 4],
        1
      );
      spark.setDepth(93);
      this.scene.tweens.add({
        targets: spark,
        x: this.x + Math.cos(ang) * dist,
        y: this.y + Math.sin(ang) * dist - 8,
        alpha: 0, scale: 0.3,
        duration: 320 + Math.random() * 180,
        ease: "Cubic.easeOut",
        onComplete: () => spark.destroy(),
      });
    }
    if (this.scene.cameras.main) this.scene.cameras.main.shake(180, 0.008);
    if (this.scene.cache && this.scene.cache.audio.exists("enemyDeathSound")) {
      this.scene.sound.play("enemyDeathSound", { volume: 1.0, rate: 0.7 });
    }
    this.destroy();
  }
}

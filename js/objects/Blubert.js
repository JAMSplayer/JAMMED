class Blubert {
  constructor(scn, jammy) {
    this.scene = scn;
    this.jammy = jammy;

    // Blubert flies ahead-and-above Jammy so his scan reaches hidden
    // enemies before Jammy does, giving time to shoot the bushes out.
    this.offsetX = 140;
    this.offsetY = -44;
    this.followSpeed = 0.045;

    this.scanRange = 320;
    this.scanInterval = 750;

    this.stunned = false;
    this.stunDuration = 3000;
    this.hp = 3;
    this.dead = false;

    this.trackedEnemy = null;

    this.sprite = scn.physics.add.sprite(
      jammy.sprite.x + this.offsetX,
      jammy.sprite.y + this.offsetY,
      "blubert",
      "idle-right1"
    );
    this.sprite.body.setAllowGravity(false);
    this.sprite.setDepth(95);
    this.sprite.parentObject = this;

    if (!scn.anims.exists("blubert-idle-right")) {
      scn.anims.create({
        key: "blubert-idle-right",
        frames: scn.anims.generateFrameNames("blubert", { prefix: "idle-right", start: 1, end: 4 }),
        frameRate: 6, repeat: -1,
      });
      scn.anims.create({
        key: "blubert-idle-left",
        frames: scn.anims.generateFrameNames("blubert", { prefix: "idle-left", start: 1, end: 4 }),
        frameRate: 6, repeat: -1,
      });
      scn.anims.create({
        key: "blubert-tilt-right",
        frames: scn.anims.generateFrameNames("blubert", { prefix: "tilt-right", start: 1, end: 4 }),
        frameRate: 8, repeat: -1,
      });
      scn.anims.create({
        key: "blubert-tilt-left",
        frames: scn.anims.generateFrameNames("blubert", { prefix: "tilt-left", start: 1, end: 4 }),
        frameRate: 8, repeat: -1,
      });
      scn.anims.create({
        key: "blubert-stunned",
        frames: scn.anims.generateFrameNames("blubert", { prefix: "stunned", start: 1, end: 4 }),
        frameRate: 10, repeat: -1,
      });
    }
    this.sprite.play("blubert-idle-right");

    this.scanTimer = scn.time.addEvent({
      delay: this.scanInterval,
      callback: () => this.scan(),
      loop: true,
    });

    // Expose for collaborators (SeedOfDestruction stuns, etc.)
    scn.blubert = this;
  }

  update() {
    if (this.dead || !this.sprite) return;
    if (!this.jammy || !this.jammy.alive) return;

    // Drop a tracked enemy that has scrolled off the visible screen.
    if (this.trackedEnemy) {
      const cam = this.scene.cameras.main;
      if (!cam.worldView.contains(this.trackedEnemy.x, this.trackedEnemy.y)) {
        this.trackedEnemy = null;
      }
    }

    let targetX, targetY, tilting = false;
    if (this.trackedEnemy && this.trackedEnemy.active &&
        !this.trackedEnemy.dead && this.trackedEnemy.scene) {
      targetX = this.trackedEnemy.x;
      // Descend only as Jammy closes on the enemy — stays high and
      // clear of the seed blast radius until the hit is imminent.
      const distJE = Phaser.Math.Distance.Between(
        this.jammy.sprite.x, this.jammy.sprite.y,
        this.trackedEnemy.x, this.trackedEnemy.y
      );
      const closeness = Phaser.Math.Clamp(1 - distJE / 220, 0, 1);
      const aboveEnemy = 90 - closeness * 72;
      targetY = this.trackedEnemy.y - aboveEnemy;
      tilting = true;
    } else {
      this.trackedEnemy = null;
      const dir = this.jammy.facing === "right" ? 1 : -1;
      targetX = this.jammy.sprite.x + this.offsetX * dir;
      targetY = this.jammy.sprite.y + this.offsetY;
    }

    // Track even more cautiously when locked onto an enemy —
    // Blubert is a scout, not a dive-bomber.
    const speed = tilting ? 0.02 : this.followSpeed;
    this.sprite.x += (targetX - this.sprite.x) * speed;
    this.sprite.y += (targetY - this.sprite.y) * speed;

    if (this.stunned) {
      this.sprite.play("blubert-stunned", true);
      return;
    }
    const facingRight = targetX >= this.jammy.sprite.x;
    const anim = tilting
      ? (facingRight ? "blubert-tilt-right" : "blubert-tilt-left")
      : (facingRight ? "blubert-idle-right" : "blubert-idle-left");
    this.sprite.play(anim, true);
  }

  scan() {
    if (this.stunned || !this.jammy || !this.jammy.alive) return;
    if (!this.scene.enemies) return;

    // Audio cue — use existing laser sound as placeholder beep
    if (this.scene.sound.get("laserSound")) {
      this.scene.sound.play("laserSound", { volume: 0.15, rate: 2.5 });
    }

    const enemies = this.scene.enemies.getChildren();
    const cam = this.scene.cameras.main;
    let nearest = null;
    let nearestDist = Infinity;
    for (const e of enemies) {
      if (!e || e.dead) continue;
      // Only care about enemies currently on screen.
      if (!cam.worldView.contains(e.x, e.y)) continue;
      const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, e.x, e.y);
      if (d > this.scanRange) continue;
      if (e.hidden && typeof e.detect === "function") {
        e.detect();
      }
      // Track the nearest detected zomberry threatening Jammy
      if (e.detected || e.inPursuit) {
        if (d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }
    }
    this.trackedEnemy = nearest;
  }

  stun() {
    if (this.stunned) return;
    this.stunned = true;
    this.trackedEnemy = null;
    this.scene.time.delayedCall(this.stunDuration, () => {
      this.stunned = false;
    });
  }

  takeSympathyDamage() {
    if (this.dead || !this.sprite || !this.sprite.active) return;
    this.hp -= 1;
    // Red flash + small knockback bob
    this.sprite.setTint(0xff5555);
    this.scene.time.delayedCall(180, () => {
      if (this.sprite && this.sprite.active) this.sprite.clearTint();
    });
    const dir = this.jammy && this.jammy.facing === "right" ? -1 : 1;
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + 14 * dir,
      y: this.sprite.y - 6,
      yoyo: true,
      duration: 120,
      ease: "Sine.easeOut",
    });
    if (this.hp <= 0) this.dispose();
  }

  dispose() {
    if (this.dead) return;
    this.dead = true;
    this.trackedEnemy = null;
    if (this.scanTimer) this.scanTimer.destroy();
    if (!this.sprite) return;
    // Tumble-and-fade farewell
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      rotation: 2.5,
      y: this.sprite.y + 20,
      duration: 600,
      ease: "Cubic.easeIn",
      onComplete: () => {
        if (this.sprite) this.sprite.destroy();
        this.sprite = null;
        if (this.scene && this.scene.blubert === this) this.scene.blubert = null;
      },
    });
  }
}

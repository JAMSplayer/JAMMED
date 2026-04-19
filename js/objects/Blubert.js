class Blubert {
  constructor(scn, jammy) {
    this.scene = scn;
    this.jammy = jammy;

    // Blubert flies ahead-and-above Jammy so his scan reaches hidden
    // enemies before Jammy does, giving time to shoot the bushes out.
    this.offsetX = 140;
    this.offsetY = -44;
    this.followSpeed = 0.2;

    this.scanRange = 320;
    this.scanInterval = 750;

    this.stunned = false;
    this.stunDuration = 3000;

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
    if (!this.jammy || !this.jammy.alive) return;

    let targetX, targetY, tilting = false;
    if (this.trackedEnemy && this.trackedEnemy.active &&
        !this.trackedEnemy.dead && this.trackedEnemy.scene) {
      targetX = this.trackedEnemy.x;
      targetY = this.trackedEnemy.y - 24;
      tilting = true;
    } else {
      this.trackedEnemy = null;
      const dir = this.jammy.facing === "right" ? 1 : -1;
      targetX = this.jammy.sprite.x + this.offsetX * dir;
      targetY = this.jammy.sprite.y + this.offsetY;
    }

    this.sprite.x += (targetX - this.sprite.x) * this.followSpeed;
    this.sprite.y += (targetY - this.sprite.y) * this.followSpeed;

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
    let nearest = null;
    let nearestDist = Infinity;
    for (const e of enemies) {
      if (!e || e.dead) continue;
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
}

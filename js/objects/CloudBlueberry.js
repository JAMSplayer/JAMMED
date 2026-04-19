// Blueberry drone that hides inside a cloud in Stage1_3. Emerges when
// Jammy comes underneath, then alternates between dropping seed bombs
// (its normal attack) and committing a dive-bomb at him.
class CloudBlueberry extends Blueberry {
  constructor(scn, x, y) {
    super(scn, x, y);

    this.body.setAllowGravity(false);

    this.hidden = true;
    this.setVisible(false);
    this.body.setEnable(false);

    // Cover cloud
    this.cloud = new Cloud(scn, x, y);

    // Ditch the vanilla "oscillate horizontally + drop bomb" loop —
    // this variant has its own AI below.
    if (this.roamTimer) { this.roamTimer.destroy(); this.roamTimer = null; }
    if (this.bombTimer) { this.bombTimer.destroy(); this.bombTimer = null; }

    this.triggerDistance = 120;   // "almost underneath" trigger
    this.dropCooldownMs = 1400;
    this.diveCooldownMs = 2200;
    this.lastAction = 0;
    this.nextAction = "drop";     // alternate drop / dive
    this.diving = false;
    this.returning = false;
    this.homeX = x;
    this.homeY = y;
  }

  update() {
    if (this.dead) return;
    const j = this.scene.jammy;
    if (!j || !j.alive) {
      // Jammy is dead/gone — halt any active dive and stop motion.
      if (this._diveTween) { this._diveTween.remove(); this._diveTween = null; }
      if (this.body) this.body.setVelocity(0, 0);
      this.diving = false;
      return;
    }

    if (this.hidden) {
      // Emerge once Jammy is close underneath
      const dx = Math.abs(j.sprite.x - this.x);
      const dy = j.sprite.y - this.y;   // positive if Jammy is below
      if (dx < this.triggerDistance && dy > 0 && dy < 180) {
        this.emerge();
      }
      return;
    }

    if (this.diving) return;

    // Hunt Jammy — hover ~88px above him, tracking his x/y across
    // the stage. Doesn't give up until killed.
    const dx = j.sprite.x - this.x;
    const dy = (j.sprite.y - 88) - this.y;
    const maxSpeed = 95;
    this.body.setVelocityX(Phaser.Math.Clamp(dx * 1.8, -maxSpeed, maxSpeed));
    this.body.setVelocityY(Phaser.Math.Clamp(dy * 1.8, -maxSpeed, maxSpeed));
    this.facing = j.sprite.x < this.x ? -1 : 1;
    this.play(this.facing === 1 ? "oscillating-right" : "oscillating-left", true);

    // Alternate attacks on a simple cooldown
    const now = this.scene.time.now;
    if (now - this.lastAction >= (this.nextAction === "dive" ? this.diveCooldownMs : this.dropCooldownMs)) {
      this.lastAction = now;
      if (this.nextAction === "dive") {
        this.diveBomb();
        this.nextAction = "drop";
      } else {
        this.dropBomb();
        this.nextAction = "dive";
      }
    }
  }

  emerge() {
    this.hidden = false;
    this.setVisible(true);
    this.body.setEnable(true);
    this.lastAction = this.scene.time.now;
    // Pop out of the cloud with a small down-tween for flavor
    this.setScale(0.4);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1, scaleY: 1,
      y: this.homeY + 18,
      duration: 240,
      ease: "Back.easeOut",
    });
  }

  dropBomb() {
    // Reuse the parent drop (creates a BlueberryBomb below this drone)
    super.dropBomb();
  }

  diveBomb() {
    this.diving = true;
    const j = this.scene.jammy;
    const startX = this.x;
    const startY = this.y;
    const targetX = j.sprite.x;
    const targetY = j.sprite.y - 8;

    // Quadratic Bezier control point: well above and slightly past the
    // start so the drone rises into a hawk-like arc before plunging
    // steeply onto Jammy.
    const midX = (startX + targetX) / 2;
    const midY = Math.min(startY, targetY) - 62;

    this.facing = targetX < this.x ? -1 : 1;
    this.play(this.facing === 1 ? "oscillating-right" : "oscillating-left", true);
    this.body.setAllowGravity(false);

    const t = { v: 0 };
    this._diveTween = this.scene.tweens.add({
      targets: t,
      v: 1,
      duration: 620,
      ease: "Quad.easeIn",
      onUpdate: () => {
        if (!this.active || this.dead) return;
        const u = 1 - t.v;
        this.x = u*u*startX + 2*u*t.v*midX + t.v*t.v*targetX;
        this.y = u*u*startY + 2*u*t.v*midY + t.v*t.v*targetY;
      },
      onComplete: () => this._diveImpact(),
    });
  }

  _diveImpact() {
    if (this.dead) return;
    // If close to Jammy on impact, deal damage
    const j = this.scene.jammy;
    if (j && j.alive) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, j.sprite.x, j.sprite.y);
      if (d < 22) j.takeDamage();
    }
    this.diving = false;
    this._diveTween = null;
    // update() resumes tracking Jammy next frame — no return tween
  }

  die() {
    if (this.cloud) {
      // Leave the cloud behind — it's just a cloud, harmless.
      this.cloud = null;
    }
    super.die();
  }
}

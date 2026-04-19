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
    // this variant has its own AI below. Parent Blueberry.die() will
    // call .destroy() on these refs, so we leave no-op stubs behind
    // instead of nulling them (otherwise die() throws on the null).
    if (this.roamTimer) this.roamTimer.destroy();
    if (this.bombTimer) this.bombTimer.destroy();
    this.roamTimer = { destroy: () => {} };
    this.bombTimer = { destroy: () => {} };

    this.triggerDistance = 120;   // "almost underneath" trigger
    this.dropCooldownMs = 1400;
    this.diveCooldownMs = 2200;
    this.lastAction = 0;
    this.nextAction = "drop";     // alternate drop / dive
    this.diving = false;
    this.returning = false;
    this.homeX = x;
    this.homeY = y;
    // Which side the drone windups on for its next dive. Flipped after
    // each dive so attacks come in from alternating directions.
    this.diveSide = Math.random() < 0.5 ? -1 : 1;
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

    // Tracking target depends on the next attack:
    //   drop -> hover directly above Jammy so the bomb falls on him
    //   dive -> post up ~170px to one side as a windup so the dive
    //           sweeps laterally through him instead of straight down.
    let targetX;
    if (this.nextAction === "drop") {
      targetX = j.sprite.x;
    } else {
      targetX = j.sprite.x + this.diveSide * 170;
    }
    const dx = targetX - this.x;
    const dy = (j.sprite.y - 88) - this.y;
    const maxSpeed = 115;
    this.body.setVelocityX(Phaser.Math.Clamp(dx * 1.8, -maxSpeed, maxSpeed));
    this.body.setVelocityY(Phaser.Math.Clamp(dy * 1.8, -maxSpeed, maxSpeed));
    this.facing = j.sprite.x < this.x ? -1 : 1;
    this.play(this.facing === 1 ? "oscillating-right" : "oscillating-left", true);

    // Alternate attacks on a simple cooldown. Drop is additionally
    // gated on being (almost) directly above Jammy so the bomb has a
    // real chance of landing — otherwise we just wait for the drone
    // to drift overhead before committing to the drop.
    const now = this.scene.time.now;
    if (now - this.lastAction >= (this.nextAction === "dive" ? this.diveCooldownMs : this.dropCooldownMs)) {
      if (this.nextAction === "dive") {
        // Wait until drone has actually reached the windup side (>=120px
        // offset in the diveSide direction) so the dive is lateral.
        const sideDelta = (this.x - j.sprite.x) * this.diveSide;
        if (sideDelta >= 120) {
          this.diveBomb();
          this.lastAction = now;
          this.nextAction = "drop";
        }
      } else if (Math.abs(this.x - j.sprite.x) <= 24) {
        this.dropBomb();
        this.lastAction = now;
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
    // Drop from the drone's own position. Tracking in update() already
    // leads Jammy so a straight drop lands in the right spot — and the
    // bomb visually trails off the drone instead of materializing mid-air.
    const bomb = new BlueberryBomb(this.scene, this.x, this.y + 8);
    this.scene.enemies.add(bomb);
  }

  diveBomb() {
    this.diving = true;
    this._diveDamaged = false;
    const j = this.scene.jammy;
    const startX = this.x;
    const startY = this.y;

    // Lateral sweep with a wide horizontal reach so the arc doesn't
    // come straight down from overhead. Drone flies in on its
    // current side, dips past Jammy at roughly his body center, and
    // exits well beyond the opposite side — giving the player a long
    // clear line to intercept with a seed.
    let side = this.x < j.sprite.x ? -1 : 1;
    // If drone was hovering near-directly above Jammy, pick a side
    // so the sweep isn't ambiguous.
    if (Math.abs(this.x - j.sprite.x) < 40) side = Math.random() < 0.5 ? -1 : 1;
    const horizReach = Math.max(260, Math.abs(this.x - j.sprite.x) + 140);
    const endX = j.sprite.x - side * horizReach;
    const endY = startY;
    const midX = j.sprite.x;
    const midY = j.sprite.y + 6;

    this.body.setAllowGravity(false);
    this.facing = endX < this.x ? -1 : 1;
    this.play(this.facing === 1 ? "oscillating-right" : "oscillating-left", true);

    const t = { v: 0 };
    this._diveTween = this.scene.tweens.add({
      targets: t,
      v: 1,
      duration: 780,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        if (!this.active || this.dead) return;
        const u = 1 - t.v;
        this.x = u*u*startX + 2*u*t.v*midX + t.v*t.v*endX;
        this.y = u*u*startY + 2*u*t.v*midY + t.v*t.v*endY;
        // Damage Jammy when the sweep passes close to him, once per dive
        if (!this._diveDamaged && this.scene.jammy && this.scene.jammy.alive) {
          const jm = this.scene.jammy.sprite;
          const d = Phaser.Math.Distance.Between(this.x, this.y, jm.x, jm.y);
          if (d < 20) {
            this._diveDamaged = true;
            this.scene.jammy.takeDamage();
          }
        }
      },
      onComplete: () => this._diveComplete(),
    });
  }

  _diveComplete() {
    if (this.dead) return;
    this.diving = false;
    this._diveTween = null;
    // Flip windup side for the next dive so attacks alternate sides
    this.diveSide = -this.diveSide;
    // update() resumes tracking Jammy next frame — no return tween
  }

  die() {
    if (this.dead) return;
    // Cancel any in-flight dive so the onUpdate doesn't keep writing
    // to x/y while super.die is playing the death anim.
    if (this._diveTween) { this._diveTween.remove(); this._diveTween = null; }
    this.diving = false;
    if (this.cloud) {
      // Leave the cloud behind — it's just a cloud, harmless.
      this.cloud = null;
    }
    super.die();
  }
}

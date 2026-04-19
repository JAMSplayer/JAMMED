class BushZomberry extends Raspberry {
  constructor(scn, x, y) {
    super(scn, x, y);

    this.hidden = true;
    this.detected = false;
    // ms between eyes appearing (detect) and the enemy actually popping out
    this.emergeDelayMs = 1100;

    this.setVisible(false);
    this.body.setEnable(false);
    this.body.setAllowGravity(false);

    // Tilemap createFromObjects calls `new BushZomberry(scene)` then
    // .setPosition(x, y), so defer bush visual creation to the position
    // setter — at construction time x/y are undefined.
    if (typeof x === "number" && typeof y === "number") {
      this._createBushVisual(x, y);
    }
  }

  _createBushVisual(x, y) {
    if (this.bush) return;
    this.bush = new Bush(this.scene, x, y);
  }

  setPosition(x, y, z, w) {
    super.setPosition(x, y, z, w);
    if (!this.bush && typeof x === "number" && typeof y === "number") {
      this._createBushVisual(x, y);
    } else if (this.bush && typeof x === "number" && typeof y === "number") {
      this.bush.setPosition(x, y);
    }
    return this;
  }

  detect() {
    if (this.detected || !this.hidden || this.dead) return;
    this.detected = true;
    if (this.bush) this.bush.setEyesVisible(true);
    // Short warning window before the zomberry bursts out
    this.scene.time.delayedCall(this.emergeDelayMs, () => this.emerge());
  }

  emerge() {
    if (!this.hidden || this.dead) return;
    this.hidden = false;
    this.setVisible(true);
    this.body.setEnable(true);
    this.body.setAllowGravity(true);
    // Bush stays behind the zomberry as a visual remnant (eyes off)
    if (this.bush) this.bush.setEyesVisible(false);
  }

  explodeInBush() {
    if (this.dead) return;
    // Seed blew the bush — kill the zomberry. Leave the bush for ambience.
    this.hidden = false;
    this.setVisible(true);
    this.body.setEnable(true);
    this.body.setAllowGravity(true);
    if (this.bush) this.bush.setEyesVisible(false);
    this.hp = 0;
    this.die();
  }

  update() {
    if (this.hidden) return;
    super.update();
  }

  die() {
    // Leave the bush visible — it's just vegetation now.
    super.die();
  }
}

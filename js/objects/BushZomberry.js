class BushZomberry extends Raspberry {
  constructor(scn, x, y) {
    super(scn, x, y);

    this.hidden = true;
    this.detected = false;
    // Emerges while Jammy still has room to cycle weapon (C) and fire (Q).
    // Jammy walks ~125 px/s, so ~120 px gives roughly a second of reaction.
    this.emergeRange = 120;

    this.setVisible(false);
    this.body.setEnable(false);
    this.body.setAllowGravity(false);

    if (!scn.anims.exists("bush-empty")) {
      scn.anims.create({
        key: "bush-empty",
        frames: [
          { key: "bush", frame: "empty1" },
          { key: "bush", frame: "empty2" },
        ],
        frameRate: 2, repeat: -1,
      });
      scn.anims.create({
        key: "bush-eyes",
        frames: [
          { key: "bush", frame: "eyes1" },
          { key: "bush", frame: "eyes2" },
        ],
        frameRate: 5, repeat: -1,
      });
    }

    // Tilemap createFromObjects calls `new BushZomberry(scene)` then
    // .setPosition(x, y), so defer bushSprite creation to the position
    // setter — at construction time x/y are undefined.
    if (typeof x === "number" && typeof y === "number") {
      this._createBushSprite(x, y);
    }
  }

  _createBushSprite(x, y) {
    if (this.bushSprite) return;
    this.bushSprite = this.scene.add.sprite(x, y + 4, "bush", "empty1");
    this.bushSprite.setDepth(50);
    this.bushSprite.play("bush-empty");
  }

  setPosition(x, y, z, w) {
    super.setPosition(x, y, z, w);
    if (!this.bushSprite && typeof x === "number" && typeof y === "number") {
      this._createBushSprite(x, y);
    } else if (this.bushSprite && typeof x === "number" && typeof y === "number") {
      this.bushSprite.setPosition(x, y + 4);
    }
    return this;
  }

  detect() {
    if (this.detected || !this.hidden || this.dead) return;
    this.detected = true;
    if (this.bushSprite) this.bushSprite.play("bush-eyes");
  }

  emerge() {
    if (!this.hidden || this.dead) return;
    this.hidden = false;
    this.setVisible(true);
    this.body.setEnable(true);
    this.body.setAllowGravity(true);
    if (this.bushSprite) {
      this.bushSprite.destroy();
      this.bushSprite = null;
    }
  }

  explodeInBush() {
    if (this.dead) return;
    // Instant kill while hidden — fall out of the bush dead
    if (this.bushSprite) {
      this.bushSprite.destroy();
      this.bushSprite = null;
    }
    this.hidden = false;
    this.setVisible(true);
    this.body.setEnable(true);
    this.body.setAllowGravity(true);
    this.hp = 0;
    this.die();
  }

  update() {
    if (this.hidden) {
      if (this.detected && this.scene.jammy && this.scene.jammy.alive) {
        const d = Phaser.Math.Distance.Between(this.x, this.y, this.scene.jammy.sprite.x, this.scene.jammy.sprite.y);
        if (d < this.emergeRange) this.emerge();
      }
      return;
    }
    super.update();
  }

  die() {
    if (this.bushSprite) {
      this.bushSprite.destroy();
      this.bushSprite = null;
    }
    super.die();
  }
}

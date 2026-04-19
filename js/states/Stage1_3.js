class Stage1_3 extends Phaser.Scene {
  constructor() {
    super({ key: "Stage1_3" });
  }

  preload() {
    scene = this;
  }

  create() {
    this.sound.stopAll();
    this.sound.play("Level1MusicLoop", { loop: true });

    // Make sure the teardrop texture exists before the HUD tries to show it
    if (typeof SeedOfDestruction !== "undefined" && SeedOfDestruction.ensureTexture) {
      SeedOfDestruction.ensureTexture(this);
    }
    // Pink sunset sky — camera background
    this.cameras.main.setBackgroundColor("#f5a8b8");

    this.map = this.make.tilemap({
      key: "stage1_3",
      tileWidth: 16,
      tileHeight: 16,
    });
    const tileset = this.map.addTilesetImage("custom-city-tiles");

    this.backgroundLayer = this.map.createLayer("BackgroundLayer", tileset);
    this.groundLayer = this.map.createLayer("GroundLayer", tileset);
    this.enemyStopBlocksLayer = this.map.createLayer("EnemyStopBlocks", tileset);
    this.deathBlocksLayer = this.map.createLayer("DeathBlocksLayer", tileset);
    this.sceneChangeLayer = this.map.createLayer("SceneChangeLayer", tileset);

    // Horizon sun — fixed parallax behind everything
    this.sun = this.add.circle(320, 88, 28, 0xfff0a8);
    this.sun.setScrollFactor(0.2);
    this.sun.setDepth(-10);

    // Blue brick ground — solid bar along the invisible-floor row
    // Floor is at tile row 11 (y=176). Paint a brick-blue block from y=176 down.
    this.groundVisual = this.add.rectangle(
      this.map.widthInPixels / 2, 216,
      this.map.widthInPixels, 80,
      0x3a5a8c
    );
    this.groundVisual.setDepth(1);
    // Subtle brick seam every 32px for texture
    for (let bx = 0; bx < this.map.widthInPixels; bx += 32) {
      const seam = this.add.rectangle(bx, 216, 1, 80, 0x2a416a);
      seam.setDepth(2);
    }

    this.enemyStopBlocksLayer.setAlpha(0);
    this.deathBlocksLayer.setAlpha(0);
    this.sceneChangeLayer.setAlpha(0);

    this.groundLayer.setCollisionByExclusion(-1);
    this.deathBlocksLayer.setCollisionByExclusion(-1);
    this.sceneChangeLayer.setCollisionByExclusion(-1);
    this.enemyStopBlocksLayer.setCollisionByExclusion(-1);

    this.bullets = this.physics.add.group();
    this.collectibles = this.physics.add.group();
    this.enemies = this.add.group();
    this.enemyProjectiles = this.physics.add.group();

    // Tilemap-driven spawns
    this.map.createFromObjects("PowerUpsLayer", {
      name: "PowerUp",
      key: "power-up",
      classType: PowerUp,
    });
    this.map.createFromObjects("AntTokenLayer", {
      key: "ant-token",
      classType: AntToken,
    });
    this.map.createFromObjects("RaspberryLayer", {
      name: "Raspberry",
      key: "raspberry",
      classType: Raspberry,
    });
    this.map.createFromObjects("BushZomberryLayer", {
      name: "BushZomberry",
      key: "raspberry",
      classType: BushZomberry,
    });
    this.map.createFromObjects("HornedFruitLayer", {
      name: "HornedFruit",
      key: "horned-fruit",
      classType: HornedFruit,
    });
    this.map.createFromObjects("WatermelonSnapperLayer", {
      name: "WatermelonSnapper",
      key: "watermelon-snapper",
      classType: WatermelonSnapper,
    });

    // Jammy
    if (this.jammyData) {
      this.jammy = new Jammy(
        this.jammyData.nextX,
        this.jammyData.nextY,
        this.jammyData.hp,
        this.jammyData.facing
      );
    } else {
      this.jammy = new Jammy(60, 100);
    }
    this.jammy.sprite.setDepth(100);
    this.jammy.controlsEnabled = true;
    this.children.bringToTop(this.jammy.sprite);

    this.cameras.main.startFollow(this.jammy.sprite);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // Collisions
    this.physics.add.overlap(
      this.jammy.sprite,
      this.collectibles,
      (jammy, collectible) => {
        collectible.effect();
      }
    );
    this.physics.add.collider(this.jammy.sprite, this.groundLayer);
    this.physics.add.collider(this.jammy.sprite, this.deathBlocksLayer, () =>
      this.jammy.instantDeath()
    );
    this.physics.add.collider(this.jammy.sprite, this.sceneChangeLayer, () =>
      this.changeScene()
    );
    this.physics.add.collider(this.collectibles, this.groundLayer);
    this.physics.add.collider(this.enemies, this.groundLayer);
    this.physics.add.collider(this.enemies, this.enemyStopBlocksLayer);

    // Bullets vs ground — AudioWaves don't currently collide with ground, so skip

    // Decoy bushes — visually identical to BushZomberry bushes but empty.
    // Mixed in so the player can't tell by sight alone; Blubert's eyes
    // reveal the real ones.
    this.decoyBushes = [
      new Bush(this, 540, 176),
      new Bush(this, 1360, 176),
      new Bush(this, 1900, 176),
      new Bush(this, 2280, 176),
    ];

    // Sky clouds — some pure decoys, some hiding blueberry drones that
    // emerge and alternate between bomb-drops and dive-bombs.
    this.decoyClouds = [
      new Cloud(this, 320, 56),
      new Cloud(this, 900, 48),
      new Cloud(this, 1480, 60),
      new Cloud(this, 2000, 52),
      new Cloud(this, 2380, 58),
    ];
    // Blueberry-bearing clouds — these create their own cover cloud
    this.cloudBlueberries = [
      new CloudBlueberry(this, 760, 56),
      new CloudBlueberry(this, 1640, 52),
      new CloudBlueberry(this, 2240, 58),
    ];
    this.cloudBlueberries.forEach(b => this.enemies.add(b));

    // Seed-ammo pickups — scarce on purpose so the player budgets shots.
    // One pre-first-bush, one mid-run, one late.
    this.seedPickups = [
      new SeedAmmoPickup(this, 300,  128),
      new SeedAmmoPickup(this, 1260, 128),
      new SeedAmmoPickup(this, 2340, 120),
    ];

    // Hanging thorn-fruit rigs — moving platform + prickly vine + fruit.
    // Built on top of the spawned HornedFruit instances; the platform
    // tweens vertically and the fruit + vine follow until dropped.
    this.hornedRigs = [];
    this.enemies.getChildren()
      .filter(e => e instanceof HornedFruit)
      .forEach((hf, i) => this._buildHornedRig(hf, i));

    // Blubert companion
    this.blubert = new Blubert(this, this.jammy);

    // Sync UI weapon indicator
    const ui = this.scene.get("UIScene");
    if (ui && ui.setWeapon) ui.setWeapon(this.jammy.currentWeapon);
  }

  update() {
    this.jammy.update();
    if (this.blubert) this.blubert.update();
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.update) enemy.update();
    });
    if (this.hornedRigs) this.hornedRigs.forEach(r => r.update());
  }

  _buildHornedRig(hf, index) {
    const baseY = hf.y;            // fruit's hang anchor
    const platformY = baseY - 44;  // platform above
    const platform = this.add.rectangle(hf.x, platformY, 44, 6, 0x8b6f4a);
    platform.setDepth(4);
    const platformTop = this.add.rectangle(hf.x, platformY - 3, 44, 2, 0x6a5432);
    platformTop.setDepth(5);

    // Prickly vine — main stalk plus a few thorns.
    const vineGfx = this.add.graphics();
    vineGfx.setDepth(3);

    // Offset phase so multiple rigs don't move in sync
    const phase = (index % 3) * 700;
    const amplitude = 26;
    const period = 2400;
    const startTime = this.time.now - phase;

    const rig = {
      hf, platform, platformTop, vineGfx,
      platformBaseY: platformY,
      amplitude, period, startTime,
      update: () => {
        if (!hf || !hf.scene) {
          vineGfx.clear();
          return;
        }
        const t = (this.time.now - startTime) / period;
        const py = platformY + Math.sin(t * Math.PI * 2) * amplitude;
        platform.y = py;
        platformTop.y = py - 3;
        if (!hf.dropped) {
          hf.y = py + 44;      // keep the fruit hanging the same distance below
          hf.baseY = hf.y;     // so the sin-bob in HornedFruit is around the current y
        }
        vineGfx.clear();
        if (!hf.dropped) {
          // Vine stalk
          vineGfx.lineStyle(2, 0x2f6a2a, 1);
          vineGfx.beginPath();
          vineGfx.moveTo(hf.x, py + 3);
          vineGfx.lineTo(hf.x, hf.y - 6);
          vineGfx.strokePath();
          // Thorns — alternating left/right barbs along the vine
          vineGfx.fillStyle(0x2f6a2a, 1);
          const vineLen = hf.y - 6 - (py + 3);
          const steps = Math.max(3, Math.floor(vineLen / 6));
          for (let s = 1; s < steps; s++) {
            const ty = py + 3 + (vineLen * s) / steps;
            const side = s % 2 === 0 ? -1 : 1;
            vineGfx.fillTriangle(
              hf.x, ty,
              hf.x + side * 4, ty - 2,
              hf.x + side * 4, ty + 2
            );
          }
        }
      },
    };
    this.hornedRigs.push(rig);
  }

  changeScene() {
    this.scene.start("EndCredits");
  }
}

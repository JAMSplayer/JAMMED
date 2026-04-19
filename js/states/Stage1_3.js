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
  }

  changeScene() {
    this.scene.start("EndCredits");
  }
}

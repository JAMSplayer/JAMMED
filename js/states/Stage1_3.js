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
    this.cameras.main.setBackgroundColor("#2a184a");

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
      this.jammy = new Jammy(40, 100);
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

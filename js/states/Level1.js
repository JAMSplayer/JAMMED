class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }

  preload() {
    // Load necessary assets here if needed
    scene = this;
  }

  create() {
    // Start music and sound effects
    
    this.sound.stopAll();
    this.sound.play("Level1MusicLoop", { loop: true });
    // Set the background color
    this.cameras.main.setBackgroundColor("#940084");

    // Add the tilemap
    this.map = this.make.tilemap({
      key: "level1Alt",
      tileWidth: 16,
      tileHeight: 16,
    });
    const tileset = this.map.addTilesetImage("custom-city-tiles");
    // Create layers from tilemap
    this.backgroundLayer = this.map.createLayer("BackgroundLayer", tileset);
    this.groundLayer = this.map.createLayer("GroundLayer", tileset);
    this.enemyStopBlocksLayer = this.map.createLayer(
      "EnemyStopBlocks",
      tileset
    );
    this.deathBlocksLayer = this.map.createLayer("DeathBlocksLayer", tileset);
    this.sceneChangeLayer = this.map.createLayer("SceneChangeLayer", tileset);

    // Make invisible layers transparent
    this.enemyStopBlocksLayer.setAlpha(0);
    this.deathBlocksLayer.setAlpha(0);
    this.sceneChangeLayer.setAlpha(0);

    // Enable collision on layers
    this.groundLayer.setCollisionByExclusion(-1);
    this.deathBlocksLayer.setCollisionByExclusion(-1);
    this.sceneChangeLayer.setCollisionByExclusion(-1);
    this.enemyStopBlocksLayer.setCollisionByExclusion(-1);

    // Create groups for bullets, enemies, collectibles, and enemy projectiles
    this.bullets = this.physics.add.group();
    this.collectibles = this.physics.add.group();
    this.enemies = this.add.group();
    this.enemyProjectiles = this.physics.add.group();

    // Convert tiles into game objects
    this.map.createFromObjects("PowerUpsLayer", {
      name: "PowerUp",
      key: "power-up",
      classType: PowerUp,
    });
    this.map.createFromObjects("BreadTokenLayer", {
      key: "coin",
      classType: Coin,
    });
    this.map.createFromObjects("RaspberryLayer", {
      name: "Raspberry",
      key: "raspberry",
      classType: Raspberry,
    });
    this.map.createFromObjects("BlueberryLayer", {
      key: "blueberry",
      classType: Blueberry,
    });
    this.map.createFromObjects("PineappleLayer", {
      name: "Pineapple",
      key: "pineapple",
      classType: Pineapple,
    });

    // Create the foreground layer
    this.foreGroundLayer = this.map.createLayer("ForegroundLayer", tileset);

    // Enable controls

    // Update HUD lifebar

    // Create and configure Jammy
    if (this.jammyData) {
      this.jammy = new Jammy(
        this.jammyData.nextX,
        this.jammyData.nextY,
        this.jammyData.hp,
        this.jammyData.velX,
        this.jammyData.velY,
        this.jammyData.facing,
        this.jammyData.levelTokensCollected
      );
    } else {
      this.jammy = new Jammy(132, 100);
    }
    this.jammy.sprite.setDepth(100);
    this.jammy.controlsEnabled = true;
    this.children.bringToTop(this.jammy.sprite);

    // Make the camera follow Jammy
    this.cameras.main.startFollow(this.jammy.sprite);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    // Check for collectibles and award tokens
    this.physics.add.overlap(
      this.jammy.sprite,
      this.collectibles,
      (jammy, collectible) => {
        collectible.effect();
      }
    );

    //create collision between Jammy and tilemap

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
  }

  update() {
    this.jammy.update();
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.update) {
        enemy.update();
      }
    });
  }

  changeScene() {
    this.scene.start("Level1BossFight");
  }

  getJammyQuadrant() {
    const worldWidth = this.cameras.main.width;
    const worldHeight = this.cameras.main.height;

    if (this.jammy.x < worldWidth / 2 && this.jammy.y < worldHeight / 2)
      return 1;
    if (this.jammy.x > worldWidth / 2 && this.jammy.y < worldHeight / 2)
      return 2;
    if (this.jammy.x < worldWidth / 2 && this.jammy.y > worldHeight / 2)
      return 3;
    return 4;
  }
}

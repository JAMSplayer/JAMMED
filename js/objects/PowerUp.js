class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "power-up", type = "", val = 1) {
    super(scene, x, y, texture, "still1");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.collectibles.add(this);
    this.val = val;
    scene.physics.add.collider(this, scene.groundLayer);
    scene.physics.add.collider(this, scene.deathBlocksLayer, () =>
      this.destroy()
    );
    scene.physics.add.collider(this, scene.sceneChangeLayer, () =>
      this.destroy()
    );
    scene.physics.add.collider(this, scene.enemyStopBlocksLayer, () =>
      this.destroy()
    );
    console.log(this);

    //this.setFrame(this.data.values.powerUpType=='heal?'? 'still1' : 'still2');
  }

  update() {}

  effect() {
    scene.jammy.powerUp(this.data.values.power, this.val);
    this.destroy();
  }
}

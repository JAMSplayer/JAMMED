class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  init(data) {
    this.gameScene = data.key;
  }

  create() {
    this.scene.bringToTop();
    let w = this.cameras.main.width / 2;
    let h = this.cameras.main.height / 2;
    this.pauseImage = this.add.image(w, h, 'pause-menu-bg');
    this.quitimage=this.add.image(w,h+10,'pause-menu-quit-game-button');
    this.quitimage.setInteractive();
    //close tab when clicked
    this.quitimage.on('pointerdown', () => {
      window.close();
    });

    this.input.keyboard.on('keydown-E', () => {
      this.scene.stop('PauseScene');
      this.scene.resume(this.gameScene);
      let level = this.scene.get(this.gameScene);
        level.cameras.main.setAlpha(1);
        this.scene.resume('UIScene');
    });
  }
}
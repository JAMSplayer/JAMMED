class TitleScreen extends Phaser.Scene {
  constructor() {
    super({ key: "TitleScreen" });
    scene=this
  }

  create() {
console.log(this.input)
    this.nextScene = "CutScene1_1";

    // Start decoding music and sfx, and start when ready
    this.sound.play("Jammed");

    //start Level1 scene on click
    this.input.once(
      "pointerdown",
      function () {
      this.scene.start('CutScene1_1');
      this.scene.launch('UIScene',{score:0,key:'Level1'});
        this.scene.bringToTop('UIScene');
      },
      this
    );

    // display the background
    var background = this.add.sprite(0, 0, "titleScreenBg");
    let centerX = this.cameras.main.centerX;
    let centerY = this.cameras.main.centerY;
    background.setOrigin(0, 0);
    // Create the press start text
    this.startTextShadow = this.add.bitmapText(
      centerX + 2,
      centerY + 2,
      "8-bit-mono",
      "START GAME",
      15
    );

    this.startTextShadow.tint = 0x000000;
    this.startText = this.add.bitmapText(
      centerX,
      centerY,
      "8-bit-mono",
      "PRESS BUTTON TO START",
      15
    );
    this.startText.setOrigin(0.5, 0.5);
    this.startTextShadow.setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: [this.startText, this.startTextShadow],
      alpha: 0,
      yoyo: true,
      repeat: -1,
      duration: 500,
      ease: "Linear",
    });
    // Conditionally, add the VirtualGamepad plugin to the scene
    // if(!this.device.desktop) {
    // 	this.createMobileControls();
    // }

    

   

  }
  update() {
   if(this.jammy){
    this.jammy.update();
    }
    // // Listen for keyboard input and act accordingly
    // if(this.input.keyboard.isDown(Phaser.Keyboard.Z) ||
    //    this.input.keyboard.isDown(Phaser.Keyboard.X)) {
    // 	this.state.start(this.nextScene);
    //     this.startGameSound.play();
    // }
    // // Go to next scene
    // if(!this.device.desktop) {
    //     if (this.jumpButton.isDown || this.attackButton.isDown || this.pauseButton.isDown) {
    //         this.state.start(this.nextScene);
    //         this.startGameSound.play();
    //     }
    // }
  }
  /**
   * Destroys or revives the start text game objects
   */
  updateCounter() {
    if (this.startText.exists) {
      this.startText.kill();
    } else {
      this.startText.revive();
    }

    if (this.startTextShadow.exists) {
      this.startTextShadow.kill();
    } else {
      this.startTextShadow.revive();
    }
  }
  render() {
    //this.debug();
    // this.debug.text('android: ' + this.device.android, 4, 14, "#00ff00");
    // this.debug.text('iOS: ' + this.device.iOS, 4, 30, "#00ff00");
    // var renderer = this.renderType == 1 ? 'Canvas' : 'WebGL';
    // this.debug.text('renderer: ' + renderer, 4, 44, "#00ff00");
    //this.debug.text(Phaser.VERSION, 4, 14, "#00ff00");
  }
}

class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  init(data) {
    this.score = data.score;
    this.gameScene = data.key;
  }

  create() {
    console.log(this.score);
    if (!this.score) {
      this.score = 0;
    }
    this.newScore = 0;
    if (!this.gameScene) {
      this.gameScene = "Level1";
    }
    this.scoreText = this.add.bitmapText(
      10,
      10,
      "tempFont",
      "Score: " + this.score,
      12
    ).setTintFill(0xffffff);

    this.input.keyboard.on(
      "keydown-E",
      () => {
        let level = this.scene.get(this.gameScene);
        level.cameras.main.setAlpha(0.5);
        this.scene.pause("UIScene");
        this.scene.pause(this.gameScene);
        this.scene.launch("PauseScene", { key: this.gameScene });
      },
      this
    );
  }

  setScore(score=100){
    this.newScore+=score;
    scene.tweens.add({
    targets:this,
    callbackScope:this,
    score:this.newScore,
    duration:1000,
    onUpdate:function(){
      this.scoreText.setText("Score: "+Math.floor(this.score))
    
    
    }
    
    });
    
    
    
    
    
    }
}

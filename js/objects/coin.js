class Coin extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y) {
        super(scene, x, y, "coin");
        this.score=1000;
        this.gameName='Coin';
    
        scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setAllowGravity(false);
this.setDisplaySize(16, 16);

    scene.collectibles.add(this);
    }


effect(){
    scene.scene.get('UIScene').setScore(this.score);
    scene.sound.play("breadTokenCollectSound");
    this.body.setEnable(false);


   this.setAlpha(1);
    this.setDisplaySize(48,48);
    scene.tweens.add({
      targets: this,
      displayWidth: 0,
      displayHeight: 0,
      alpha:0,
      duration: 200,
      ease: "Linear",
      onComplete: () => {
        this.destroy();
      },
    });
}



}
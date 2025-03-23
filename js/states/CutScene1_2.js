class CutScene1_2 extends Phaser.Scene {
  constructor() {
    super({ key: "CutScene1_2" });
  }

  init() {
    scene = this;
  }

  preload() {
    // Preload assets if necessary
  }

  create() {
    console.log("On Cut Scene 1-2...");

    // Bool to track state of scene
    this.storyComplete = false;
    const fadeTime = 500;

    // Create the background
    this.background = this.add
      .sprite(0, 0, "storyboard-city-runamuck")
      .setAlpha(0)
      .setOrigin(0);

    // Create the text
    const text =
      "When Jammy steps out, the city is in ruins, and over-run with Zomberries!!! What happened??";
    this.textContentShadow = this.add
      .bitmapText(this.cameras.main.centerX + 1, 181, "8-bit-mono", text, 12)
      .setOrigin(0.5)
      .setMaxWidth(330)
      .setTint(0x000000)
      .setAlpha(0);

    this.textContent = this.add
      .bitmapText(this.cameras.main.centerX, 180, "8-bit-mono", text, 12)
      .setOrigin(0.5)
      .setMaxWidth(330)
      .setTint(0xd8f878)
      .setAlpha(0);

    // Fade in the background and then the text
    this.tweens.add({
      targets: this.background,
      alpha: 1,
      duration: fadeTime,
      onComplete: () => {
        this.tweens.add({
          targets: this.textContentShadow,
          alpha: 1,
          duration: fadeTime,
        });
        this.tweens.add({
          targets: this.textContent,
          alpha: 1,
          duration: fadeTime,
          onComplete: () => {
            this.storyComplete = true;
          },
        });
      },
    });

    scene.input.on(
      "pointerdown",
      function (pointer) {
        this.transitionToNextScene();
      },
      this
    );

    this.input.keyboard.on(
      "keydown",
      function (event) {
        this.transitionToNextScene();
      },
      this
    );
  }

  update() {}

  transitionToNextScene() {
    if (this.storyComplete) {
      const fadeTime = 500;

      // Fade out background and text, then start next scene
      this.tweens.add({
        targets: [this.background, this.textContent, this.textContentShadow],
        alpha: 0,
        duration: fadeTime,
        onComplete: () => {
          this.scene.start("CutScene1_3");
        },
      });
    }
  }
}

class VirtualGamepad {
  constructor(scene) {
    this.gamepad = scene.plugins.get("rexvirtualjoystickplugin").add(scene, {
      x: 50,
      y: 215,
      radius: 50,
      base: scene.add.image(50, 250, "gamepad", 2).setAlpha(0.5).setScale(0.65),
      thumb: scene.add.image(50, 250, "gamepad", 1).setAlpha(0.5).setScale(0.45),
      dir: "8dir",
      forceMin: 16,
      enable: true,
    });

    this.gamepad.createCursorKeys();

    this.xButton = scene.add
      .image(275, 215, "gamepad", 0)
      .setInteractive()
      .setScale(0.5)
      .setAlpha(0.5)
      .setScrollFactor(0);
    this.zButton = scene.add
      .image(350, 215, "gamepad", 0)
      .setInteractive()
      .setScale(0.5)
      .setAlpha(0.5)
      .setScrollFactor(0);

    this.xButton.on(
      "pointerdown",
      function () {
        this.xButton.setFrame(1);
      },
      this
    );

    this.xButton.on(
      "pointerup",
      function () {
        this.xButton.setFrame(0);
      },
      this
    );

    this.zButton.on(
      "pointerdown",
      function () {
        this.zButton.setFrame(1);
      },
      this
    );

    this.zButton.on(
      "pointerup",
      function () {
        this.zButton.setFrame(0);
      },
      this
    );

    // this.zButton.setScrollFactor(0);
    // this.xButton.setScrollFactor(0);
    // this.gamepad.base.setScrollFactor(0);
    // this.gamepad.thumb.setScrollFactor(0);
    


  }
}

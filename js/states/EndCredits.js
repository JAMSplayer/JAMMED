class EndCredits extends Phaser.Scene {
  constructor() {
    super({ key: "EndCredits" });
  }

  preload() {}
  create() {
    console.log("On End Credits...");

    // Bool to track state of scene
    this.sceneComplete = false;
    this.fadeDelay = 1000;
    this.fadeTime = 3000;
    this.nextLineDelay = 240; // 4 seconds

    // Start decoding music and sfx, and start when ready
    this.sound.play("Level1MusicLoop");

    // Create the background

    // Create award statements for collected bread tokens
    this.awardStatements = [
      "Good try! Next time, try collecting the Bread Tokens.",
      "Good try! Next time, try collecting all five Bread Tokens.",
      "Not bad! Next time, try collecting all five Bread Tokens.",
      "Pretty Good! Next time, try collecting all five Bread Tokens.",
      "Excellent! You were just one Bread Token shy of perfection.",
      "Superb! You are a Jammed Master!",
    ];

    // Create credit roll text
    this.textBlockIndex = 0;
    this.textBlocks = [
      {
        topLine: "Executive Producer",
        bottomLine: "Nicholas Koteskey",
      },
      {
        topLine: "Producer",
        bottomLine: "Jim Kulakowski",
      },
      {
        topLine: "Programmers\n",
        bottomLine: " Dustin McMurry \n Jim Kulakowski",
      },
      {
        topLine: "Level Design\n\n",
        bottomLine: "\nNicholas Koteskey \n  Jim Kulakowski \n  Dustin McMurry",
      },
      {
        topLine: "Music Composer / Sound Engineer",
        bottomLine: "Jim Kulakowski",
      },
      {
        topLine: "Artist",
        bottomLine: "Jim Kulakowski",
      },
      {
        topLine: "Storyboard Art",
        bottomLine: "Nicholas Koteskey",
      },
    ];

    let centerX = this.cameras.main.centerX;
    let centerY = this.cameras.main.centerY;

    this.textTopLine = this.add.bitmapText(
      centerX,
      centerY - 8,
      "8-bit-mono",
      this.textBlocks[this.textBlockIndex].topLine,
      12
    );
    this.textTopLine.setOrigin(0.5, 0.5);
    //this.textTopLine.maxWidth = 330;
    this.textTopLine.tint = 0xffffff;
    this.textTopLine.alpha = 0;

    this.textBottomLine = this.add.bitmapText(
      centerX,
      centerY + 8,
      "8-bit-mono",
      this.textBlocks[this.textBlockIndex].bottomLine,
      12
    );
    this.textBottomLine.setOrigin(0.5, 0.5);
    // this.textBottomLine.maxWidth = 330;
    this.textBottomLine.tint = 0xffffff;
    this.textBottomLine.alpha = 0;

    // Enable physics game engine to use Phaser tweens
    this.physics.add.existing(this.textTopLine);
    this.physics.add.existing(this.textBottomLine);
    this.textTopLine.immovable = true;
    this.textBottomLine.immovable = true;

    // Fade in the text
    //this.fadeLinesIn();
    // Fade this text block out
    this.tweens.add({
      targets: [this.textTopLine],
      alpha: 1,
      duration: this.fadeTime,
      //easing: "Linear",
      yoyo: true,
      //delay: this.fadeDelay,
      repeat: -1,
      ease: "Cubic",
      callbackScope: this,
      onRepeat: function () {
        console.log("Yoyo", this.textBlockIndex, this.textBlocks.length);
        this.textBlockIndex++;
        console.log("Yoyo", this.textBlockIndex, this.textBlocks.length);
        console.log(this.textBlocks);

        if (this.textBlockIndex > this.textBlocks.length - 1) {
          this.textBlockIndex = 0;
        }
        console.log(this.textBlocks[this.textBlockIndex].topLine);
        this.textTopLine.setText(this.textBlocks[this.textBlockIndex].topLine);
        this.textBottomLine.setText(
          this.textBlocks[this.textBlockIndex].bottomLine
        );
      },
    });

    this.tweens.add({
      targets: [this.textBottomLine],
      alpha: 1,
      duration: this.fadeTime,
      ease: "Cubic",
      yoyo: true,
      //delay: this.fadeDelay,
      repeat: -1,
      callbackScope: this,
    });
  }
  update() {
    // If the scene is complete, transition to the next scene when
    // action button is pressed
    if (this.sceneComplete == true) {
      // Listen for keyboard input and act accordingly
      if (
        this.input.keyboard.isDown(Phaser.Keyboard.Z) ||
        this.input.keyboard.isDown(Phaser.Keyboard.X)
      ) {
        this.transitionToNextScene();
      }

      // Go to level 1
      if (!this.device.desktop) {
        if (this.jumpButton.isDown || this.attackButton.isDown) {
          this.transitionToNextScene();
        }
      }
    }
    // Loop through lines in textBlocks array
    if (this.nextLineDelay == 0) {
      // Go to next text block

      // If there is another text block, fade it in. Otherwise, start
      // bread token count and scene end
      if (this.textBlockIndex < this.textBlocks.length) {
        // Fade next text block in
        // this.topLineFadeOut.onComplete.add(function () {
        //   this.time.events.add(
        //     0,
        //     function () {
        //       // Switch text
        //       this.textTopLine.setText(
        //         this.textBlocks[this.textBlockIndex].topLine
        //       );
        //       this.textBottomLine.setText(
        //         this.textBlocks[this.textBlockIndex].bottomLine
        //       );
        //       this.fadeLinesIn();
        //     },
        //     this
        //   );
        // }, this);
        // Reset countdown to next text changes
        // this.resetLineDelay();
      } else {
        return;
        // Show collected bread tokens after fading out final text
        this.time.events.add(
          this.fadeTime,
          function () {
            // Create the bread tokens and hide them
            this.initBreadTokens();

            // Show Collected Bread Tokens
            for (var i = 0; i < this.breadTokensCollected.level1; i++) {
              var breadToken = this.finalBreadTokens[i];
              breadToken.alpha = 1;
              breadToken.scale.setTo(5, 5);
              this.add
                .tween(breadToken.scale)
                .to({ x: 1, y: 1 }, 500, "Linear", true);
            }

            // Fade final award text in and enable the user to go back
            // to the title screen
            this.time.events.add(
              1000,
              function () {
                this.awardText = this.add.bitmapText(
                  centerX,
                  centerY + 32,
                  "8-bit-mono",
                  this.awardStatements[this.breadTokensCollected.level1],
                  12
                );
                this.awardText.anchor.setTo(0.5, 0.5);
                this.awardText.maxWidth = 300;
                this.awardText.tint = 0xffffff;
                this.awardText.alpha = 0;

                // Fade the text in
                this.add
                  .tween(this.awardText)
                  .to(
                    { alpha: 1 },
                    this.fadeTime,
                    "Linear",
                    true,
                    this.fadeDelay
                  );

                // Enable user to skip back to title screen
                this.sceneComplete = true;

                // Conditionally, add the VirtualGamepad plugin to the
                // scene
                if (!this.device.desktop) {
                  this.createMobileControls();
                }

                // Reset Bread Tokens
                this.breadTokensCollected.level1 = 0;
              },
              this
            );
          },
          this
        );
      }
    }

    // Count down timer for next text lines
    this.nextLineDelay--;
  }

  initBreadTokens() {
    // Initiate group to store Bread Tokens
    this.collectibles = this.add.group();

    // Add bread tokens to stage and center anchor each
    this.finalBreadTokenOutlines = [
      this.add.image(centerX - 32, centerY, "bread-token-outline-hud"),
      this.add.image(centerX - 16, centerY, "bread-token-outline-hud"),
      this.add.image(centerX, centerY, "bread-token-outline-hud"),
      this.add.image(centerX + 16, centerY, "bread-token-outline-hud"),
      this.add.image(centerX + 32, centerY, "bread-token-outline-hud"),
    ];
    for (var i = 0; i < this.finalBreadTokenOutlines.length; i++) {
      this.finalBreadTokenOutlines[i].anchor.setTo(0.5, 0.5);
    }

    // Add animated bread tokens and hide them
    this.finalBreadTokens = [
      new BreadToken(this, centerX - 32, centerY),
      new BreadToken(this, centerX - 16, centerY),
      new BreadToken(this, centerX, centerY),
      new BreadToken(this, centerX + 16, centerY),
      new BreadToken(this, centerX + 32, centerY),
    ];
    for (var i = 0; i < this.finalBreadTokens.length; i++) {
      this.finalBreadTokens[i].alpha = 0;
    }
  }
  transitionToNextScene() {
    this.state.start("TitleScreen");
  }
  launchSound() {
    this.allSounds.shift();
    if (!this.bgMusic.isPlaying) {
      this.bgMusic.loopFull(0.9);
    }
  }
  startSounds(songTitle) {
    // Check for existing background music. If there is none, or if the
    // song is the same as what's already playing, continue. Otherwise,
    // stop the current song and play the requested song
    if (this.bgMusic && this.bgMusic.name != songTitle) {
      this.bgMusic.stop();
      this.bgMusic = this.add.audio(songTitle);
    }
    if (!this.bgMusic) {
      this.bgMusic = this.add.audio(songTitle);
    }

    // Enable the various sound effects
    this.jumpSound = this.add.audio("jumpSound");
    this.laserSound = this.add.audio("laserSound");
    this.heroTakeHitSound = this.add.audio("shortExplosion");
    this.enemyHitSound = this.add.audio("shortWave");
    this.enemyDeathSound = this.add.audio("shortExplosion");
    this.allSounds = [
      this.bgMusic,
      this.jumpSound,
      this.laserSound,
      this.heroTakeHitSound,
      this.enemyHitSound,
      this.enemyDeathSound,
    ];
    this.sound.setDecodedCallback(this.allSounds, this.launchSound, this);
  }
}

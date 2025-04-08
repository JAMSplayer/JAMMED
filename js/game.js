window.addEventListener('DOMContentLoaded', function() {
    // Game configuration
    var config = {
        type: Phaser.AUTO,
        width: 426,
        height: 240,
        scene: [Boot, Preload, TitleScreen, PauseScene, UIScene,CutScene1_1, CutScene1_2, CutScene1_3, Level1, Level1BossFight, CutSceneWatermelonDefeated, EndCredits],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 900 },
                //debug: true
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
    };

    // Create the game object
    var game = new Phaser.Game(config);

    game.createMobileControls = function() {
        // Update to Phaser 3 compatible code if necessary
    };

    // Add global map to track bread tokens collected per level
    game.breadTokensCollected = {
        level1: 0
    };

    // Add lifebar and other HUD items to a state/scene
    game.addHUD = function() {
        game.hud = {
            lifebar: {
                guts: game.add.image(8, 8, 'lifebar-guts'),
                outline: game.add.image(8, 8, 'lifebar-outline')
            },
            // Flash lifebar pink when Jammy is collecting life power up
            flashOnce: function() {
                this.lifebar.guts.tint = 0xf8a4c0;
                game.time.events.add(50, function() {
                    this.lifebar.guts.tint = 0xffffff;
                }, this);
            }
        };
    };
});
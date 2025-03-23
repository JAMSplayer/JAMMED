class EnemyDeath extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy-death");
        this.scene = scene;

        // Add sprite to the scene
        this.scene.add.existing(this);

        // Set anchor (origin)
        this.setOrigin(0.5, 0.5);

        // Add animations and play the death animation
        this.scene.anims.create({
            key: "death",
            frames: this.scene.anims.generateFrameNames("enemy-death", {
                prefix: "death",
                start: 1,
                end: 2,
            }),
            frameRate: 10,
            repeat: -1,
        });
		this.scene.sound.play("enemyDeathSound"); // Play sound effect

        this.play("death").on("animationcomplete", () => {
		this.destroy();
	})

      
    }

   


    // Empty update method (if needed for future functionality)
    update() {}
}

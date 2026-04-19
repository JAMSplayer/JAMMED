// Collectible seed-ammo pickup. Uses the same generated teardrop
// texture as the projectile so the player recognizes it, scaled up
// and pulsing so it reads as a collectible.
class SeedAmmoPickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scn, x, y) {
    if (SeedOfDestruction && SeedOfDestruction.ensureTexture) {
      SeedOfDestruction.ensureTexture(scn);
    }
    super(scn, x, y, "seed-teardrop");
    this.gameName = "SeedAmmo";
    this.amount = 3;

    scn.add.existing(this);
    scn.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.setScale(2);
    this.setRotation(-0.2);
    this.setTint(0xffd188);

    scn.collectibles.add(this);

    // Pulse so it stands out against the sky
    scn.tweens.add({
      targets: this,
      scale: 2.3,
      duration: 560,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  effect() {
    if (scene.jammy && typeof scene.jammy.addSeedAmmo === "function") {
      scene.jammy.addSeedAmmo(this.amount);
    }
    if (scene.sound && scene.cache.audio.exists("powerUpSound")) {
      scene.sound.play("powerUpSound", { volume: 0.6, rate: 1.2 });
    }
    this.destroy();
  }
}

// Puffy white cartoon cloud built from overlapping circles. Used as a
// decoy and as the cover for CloudBlueberry hideouts. Drifts slowly
// left/right so the sky feels alive.
class Cloud {
  constructor(scene, x, y) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(40);

    const lobes = [
      { x: 0,   y: 0,   r: 14, c: 0xffffff },
      { x: -18, y: 3,   r: 12, c: 0xf2f4fa },
      { x: 18,  y: 3,   r: 12, c: 0xf2f4fa },
      { x: -9,  y: -9,  r: 11, c: 0xffffff },
      { x: 10,  y: -10, r: 11, c: 0xffffff },
      { x: 28,  y: -2,  r: 9,  c: 0xf2f4fa },
      { x: -28, y: -2,  r: 9,  c: 0xf2f4fa },
    ];
    for (const lb of lobes) {
      this.container.add(scene.add.circle(lb.x, lb.y, lb.r, lb.c));
    }
    // Soft lower-rim shadow for depth
    const shade = scene.add.ellipse(0, 8, 62, 6, 0xbfc7d6, 0.55);
    this.container.add(shade);

    // Eyes — hidden by default, revealed when a hiding enemy is detected
    this.leftEye = scene.add.circle(-10, -3, 4, 0xffffff);
    this.rightEye = scene.add.circle(10, -3, 4, 0xffffff);
    this.leftIris = scene.add.circle(-10, -3, 2.5, 0xffbd33);
    this.rightIris = scene.add.circle(10, -3, 2.5, 0xffbd33);
    this.leftPupil = scene.add.circle(-10, -2, 1.5, 0x000000);
    this.rightPupil = scene.add.circle(10, -2, 1.5, 0x000000);
    this.eyeParts = [
      this.leftEye, this.rightEye,
      this.leftIris, this.rightIris,
      this.leftPupil, this.rightPupil,
    ];
    this.container.add(this.eyeParts);
    this.setEyesVisible(false);

    // Slow drift
    const range = 20 + Math.random() * 10;
    const duration = 4200 + Math.random() * 1800;
    scene.tweens.add({
      targets: this.container,
      x: { from: x - range, to: x + range },
      duration,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  get x() { return this.container ? this.container.x : 0; }
  get y() { return this.container ? this.container.y : 0; }

  setEyesVisible(v) {
    if (!this.eyeParts) return;
    this.eyeParts.forEach(e => e.setVisible(v));
    if (v) {
      this.eyeParts.forEach(e => {
        e.setScale(0.2);
        this.scene.tweens.add({
          targets: e, scaleX: 1, scaleY: 1,
          duration: 180, ease: "Back.easeOut",
        });
      });
    }
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

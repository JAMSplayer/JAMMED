// Shared cartoon-cloud bush visual used by BushZomberry and decoys.
// Overlapping green lobes form a wide fluffy shape that sits on the
// ground. Eyes are large white sclera + yellow glowing iris + black
// pupil + an angry brow; they're hidden until Blubert's scan reveals
// them, then pop in with a scale-up tween.
class Bush {
  constructor(scene, x, y) {
    this.scene = scene;
    // Container centers at (x, y - 12) so the cluster hangs above ground
    this.container = scene.add.container(x, y - 12);
    this.container.setDepth(50);

    const lobes = [
      { x: 0,   y: 0,   r: 14, c: 0x55a34a },
      { x: -16, y: 2,   r: 12, c: 0x479439 },
      { x: 16,  y: 2,   r: 12, c: 0x479439 },
      { x: -7,  y: -10, r: 11, c: 0x6bb85e },
      { x: 9,   y: -11, r: 11, c: 0x6bb85e },
      { x: 24,  y: -3,  r: 8,  c: 0x55a34a },
      { x: -24, y: -3,  r: 8,  c: 0x55a34a },
    ];
    for (const lb of lobes) {
      const c = scene.add.circle(lb.x, lb.y, lb.r, lb.c);
      this.container.add(c);
    }
    // A slightly darker base shadow sliver for "on ground"
    const base = scene.add.ellipse(0, 10, 52, 6, 0x2c5a24, 0.6);
    this.container.add(base);

    // Eye group — bigger and more obviously faceful when revealed.
    // Sclera (white) → iris (yellow glow) → pupil (black). Brow (angry) above.
    this.leftEye = scene.add.circle(-9, -4, 5, 0xffffff);
    this.rightEye = scene.add.circle(9, -4, 5, 0xffffff);
    this.leftIris = scene.add.circle(-9, -4, 3.5, 0xffdd44);
    this.rightIris = scene.add.circle(9, -4, 3.5, 0xffdd44);
    this.leftPupil = scene.add.circle(-9, -3, 2, 0x000000);
    this.rightPupil = scene.add.circle(9, -3, 2, 0x000000);
    this.leftBrow = scene.add.rectangle(-9, -10, 10, 2, 0x1a1a1a);
    this.rightBrow = scene.add.rectangle(9, -10, 10, 2, 0x1a1a1a);
    this.leftBrow.setRotation(0.25);
    this.rightBrow.setRotation(-0.25);

    this.eyeParts = [
      this.leftEye, this.rightEye,
      this.leftIris, this.rightIris,
      this.leftPupil, this.rightPupil,
      this.leftBrow, this.rightBrow,
    ];
    this.container.add(this.eyeParts);
    this.setEyesVisible(false);
  }

  setEyesVisible(v) {
    this.eyeParts.forEach(e => e.setVisible(v));
    if (v) {
      // Pop-in: scale from 0 with a bit of overshoot so it reads as "eyes open"
      this.eyeParts.forEach(e => {
        e.setScale(0.2);
        this.scene.tweens.add({
          targets: e,
          scaleX: 1, scaleY: 1,
          duration: 180,
          ease: "Back.easeOut",
        });
      });
    }
  }

  // Shake the whole bush briefly — used when the zomberry bursts out
  shake(ms = 260) {
    const baseX = this.container.x;
    this.scene.tweens.add({
      targets: this.container,
      x: { from: baseX - 3, to: baseX + 3 },
      duration: 40,
      yoyo: true,
      repeat: Math.max(1, Math.floor(ms / 80)),
      onComplete: () => { this.container.x = baseX; },
    });
  }

  setPosition(x, y) {
    this.container.setPosition(x, y - 12);
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}

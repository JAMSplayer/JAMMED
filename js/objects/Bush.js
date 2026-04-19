// Shared cartoon-cloud bush visual used by BushZomberry and decoys.
// Five overlapping green circles form a wide fluffy shape that sits
// on the ground. Eyes are two small white ovals with black pupils,
// hidden by default and revealed when Blubert tracks the bush.
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

    // Eyes — white sclera + black pupil
    this.leftEye = scene.add.circle(-7, -3, 3, 0xffffff);
    this.rightEye = scene.add.circle(7, -3, 3, 0xffffff);
    this.leftPupil = scene.add.circle(-7, -3, 1.5, 0x000000);
    this.rightPupil = scene.add.circle(7, -3, 1.5, 0x000000);
    this.container.add([this.leftEye, this.rightEye, this.leftPupil, this.rightPupil]);
    this.setEyesVisible(false);
  }

  setEyesVisible(v) {
    [this.leftEye, this.rightEye, this.leftPupil, this.rightPupil].forEach(e => e.setVisible(v));
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

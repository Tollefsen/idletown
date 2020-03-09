export default class Explosion {
  constructor(scene, x, y, velocity) {
    this.counter = 0;
    this.velocity;
    this.sprite = scene.physics.add
      .sprite(x + 5, y + 10, "explotion", "explotion.000")
      .setSize(128, 128)
      .setOffset(64, 64);
    this.sprite.angle = Math.random() * 45;
  }

  update(removeExplotion) {
    this.counter++;
    const frame = this.counter % 32;
    this.sprite.setTexture("explotion", `explotion.00${frame}`);
    if (frame === 0) {
      this.sprite.destroy();
      removeExplotion();
    }
  }
}

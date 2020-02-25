import state from "../state.js";

export default class Doglin {
  constructor(scene, x, y) {
    this.sprite = scene.physics.add.sprite(x, y, "doglin").setSize(32, 32);
  }

  getSprite() {
    return this.sprite;
  }

  update(scene, player) {
    this.sprite.body.setVelocity(0);
    if (scene.physics.world.collide(player.getSprite(), this.sprite)) {
      state.update(oldState => ({
        ...oldState,
        playerHealth: oldState.playerHealth - 1
      }));
    }
  }
}

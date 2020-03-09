import state from "../state";

export default class WinScene extends Phaser.Scene {
  constructor() {
    super({ active: false, visible: false, key: "Win" });
  }

  preload() {}

  create() {
    this.add
      .text(
        16,
        16,
        `You win! Your time is ${state.get("timer")}\nPress "R" to restart`,
        {
          font: "18px monospace",
          fill: "#000000",
          padding: { x: 20, y: 10 },
          backgroundColor: "#ffffff"
        }
      )
      .setScrollFactor(0)
      .setDepth(30);

    this.input.keyboard.once("keydown_R", event => {
      state.update(oldState => ({ ...oldState, playerHealth: 3, timer: 0 }));
      this.scene.start("Game");
    });
  }
}

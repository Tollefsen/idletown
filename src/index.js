/**
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */
import MainScene from "./scenes/mainscene.js";
import GameOverScene from "./scenes/gameover.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [MainScene, GameOverScene]
};

const game = new Phaser.Game(config);

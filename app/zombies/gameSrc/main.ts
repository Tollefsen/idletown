import type { KAPLAYCtx } from "kaplay";
import { addDemoScene } from "./scene/demo";
import { gameScene } from "./scene/game";
import { gameOverScene } from "./scene/gameOver";
import { introScene } from "./scene/intro";
import { transitionScene } from "./scene/transition";
import { winScene } from "./scene/win";

export function setupGame(k: KAPLAYCtx<{}, never>) {
  k.loadSprite("bean", "sprites/bean.png");
  k.loadSprite("playerface", "sprites/Playerface.png");
  k.loadSprite("healthFull", "sprites/HealthFull.png");
  k.loadSprite("healthEmpty", "sprites/HealthEmpty.png");
  k.loadSprite("grass", "sprites/grass-tiles.jpeg");

  introScene(k);
  gameScene(k);
  gameOverScene(k);
  winScene(k);
  transitionScene(k);
  addDemoScene(k);

  k.go("game", 1);
}

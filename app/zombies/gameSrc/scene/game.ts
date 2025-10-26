import type { KAPLAYCtx } from "kaplay";
import { addNormalEnemyAvoidPlayer } from "../entity/Enemy";
import { addGun } from "../entity/Gun";
import { addDefaultPlayer } from "../entity/Player";
import {
  bulletHitsEnemy,
  enemyHitsEnemy,
  enemyHitsPlayer,
  playerPicksupGun,
} from "../system/Collisions";
import { EnemyAI } from "../system/EnemyAI";
import { addPlayerControllers } from "../system/PlayerControllers";
import { PlayerSystem } from "../system/PlayerSystem";
import { doXTimes } from "../utils";

export function gameScene(k: KAPLAYCtx<Record<string, never>, never>) {
  return k.scene("game", (numberOfEnemies: number) => {
    // Entities

    // Add player
    const player = addDefaultPlayer(k);

    // Add score
    const score = k.add([
      k.text(`${numberOfEnemies - player.score}`),
      k.pos(k.center()),
    ]);

    // Add enemies
    doXTimes(numberOfEnemies, () => addNormalEnemyAvoidPlayer(k, player));

    // Add gun
    addGun(k);

    // Systems

    addPlayerControllers(k, player);

    bulletHitsEnemy(k);
    enemyHitsPlayer(k);
    enemyHitsEnemy(k);
    playerPicksupGun(k);
    PlayerSystem(k, numberOfEnemies);

    EnemyAI(k, player, score, numberOfEnemies);
  });
}

import type { GameObj, KAPLAYCtx } from "kaplay";
import { isEnemy } from "../entity/Enemy";
import type { PlayerComp } from "../entity/Player";
import { getDemoSceneGameState } from "../scene/demo";
import { findDirection, findDistance } from "../utils";

export function DemoEnemyAI(
  k: KAPLAYCtx<Record<string, never>, never>,
  player: GameObj<PlayerComp>,
) {
  const enemies = k.get("enemy");

  enemies.forEach((enemy) => {
    if (!isEnemy(enemy)) return;

    enemy.onDeath(() => {
      const gameState = getDemoSceneGameState(k);
      gameState.enemiesKilled += 1;
      gameState.playerScore += 10;
      k.destroy(enemy);
    });
    enemy.onStateEnter("stunned", async () => {
      await k.wait(1.5);
      enemy.enterState("idle");
    });
    enemy.onStateEnter("charge", async () => {
      await k.wait(0.2);
      enemy.enterState("leap");
    });
    enemy.onStateEnter("leap", async () => {
      await k.wait(0.2);
      enemy.enterState("stunned");
    });
    enemy.onUpdate(() => {
      if (!player.exists()) return; // Enemy AI can shut down when there are no players

      if (enemy.state === "aggro") {
        const distanceToplayer = findDistance(enemy, player);
        if (distanceToplayer < 100) {
          enemy.enterState("charge");
        }
        enemy.move(findDirection(enemy, player).unit().scale(enemy.speed));
      }

      if (enemy.state === "leap") {
        enemy.move(
          findDirection(enemy, player)
            .unit()
            .scale(enemy.speed * 4),
        );
      }

      if (enemy.state === "idle") {
        const distanceToplayer = findDistance(enemy, player);
        if (distanceToplayer < 400) {
          enemy.enterState("aggro");
        }
      }
    });
  });
}

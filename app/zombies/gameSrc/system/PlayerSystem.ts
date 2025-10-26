import type { KAPLAYCtx } from "kaplay";
import { isPlayer } from "../entity/Player";

export function PlayerSystem(
  k: KAPLAYCtx<Record<string, never>, never>,
  numberOfEnemies: number,
) {
  const player = k.get("player")[0];
  if (!isPlayer(player)) return;

  player.onDeath(() => {
    k.destroy(player);
    k.go("game over", numberOfEnemies);
  });
  player.onStateEnter("stunned", async () => {
    player.opacity = 0.5;
    await k.wait(0.5);
    player.enterState("normal");
    player.opacity = 1;
  });
  player.onUpdate(() => {
    if (player.score === numberOfEnemies) {
      if (player.score === 2) {
        k.go("win");
      } else {
        k.go("transition", numberOfEnemies);
      }
    }
  });
}

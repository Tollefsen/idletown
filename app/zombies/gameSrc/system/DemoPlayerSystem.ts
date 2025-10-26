import type { KAPLAYCtx } from "kaplay";
import { isPlayer } from "../entity/Player";

export function addDemoPlayerSystem(
  k: KAPLAYCtx<Record<string, never>, never>,
) {
  const player = k.get("player")[0];
  if (!isPlayer(player)) return;

  player.onDeath(() => {
    k.destroy(player);
  });

  player.onHurt(() => {
    k.get("healthbar")[0].health = player.hp();
  });

  player.onStateEnter("stunned", async () => {
    player.opacity = 0.5;
    await k.wait(0.5);
    player.enterState("normal");
    player.opacity = 1;
  });

  player.onStateEnter("dash", async () => {
    const playerAreaOffset = player.area.offset;
    player.opacity = 0.3;
    player.speed = player.speed * 3;
    player.area.offset = k.vec2(10000, 10000);
    await k.wait(0.2);
    player.enterState("cooldown");
    player.opacity = 1;
    player.speed = 320;
    player.area.offset = playerAreaOffset;
  });

  player.onStateEnter("cooldown", async () => {
    await k.wait(0.1);
    player.enterState("normal");
  });

  player.onUpdate(() => {
    k.setCamPos(player.pos);
  });
}

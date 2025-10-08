import type { GameObj, KAPLAYCtx } from "kaplay";
import { findDirection, findDirectionObjToPos, findDistance } from "../utils";
import type { PlayerComp } from "./Player";

export const spawnBullet = (
  k: KAPLAYCtx<{}, never>,
  player: GameObj<PlayerComp>,
) => {
  if (!player.hasGun || !player.exists) return;
  const allEnemies = k.get("enemy").sort((a, b) => {
    const aDist = findDistance(a, player);
    const bDist = findDistance(b, player);
    if (aDist > bDist) return 1;
    if (aDist < bDist) return -1;
    return 0;
  });
  if (allEnemies.length < 1) return;

  const direction = findDirection(player, allEnemies[0]);
  k.add([
    k.pos(player.pos),
    k.sprite("bean"),
    k.scale(0.5),
    k.area(),
    k.offscreen({ destroy: true }),
    k.move(direction, 400),
    "bullet",
  ]);
};

export function spawnBulletTowardsMouse(
  k: KAPLAYCtx<{}, never>,
  player: GameObj<PlayerComp>,
) {
  if (!player.hasGun || !player.exists) return;

  const direction = findDirectionObjToPos(player, k.toWorld(k.mousePos()));

  k.add([
    k.pos(player.pos),
    k.sprite("bean"),
    k.scale(0.5),
    k.area(),
    k.offscreen({ destroy: true }),
    k.move(direction, 400),
    "bullet",
  ]);
}

/* export function shootGun(player: GameObj<PlayerComp>, gun) { } */

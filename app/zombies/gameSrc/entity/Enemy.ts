import type {
  AreaComp,
  GameObj,
  HealthComp,
  KAPLAYCtx,
  PosComp,
  RectComp,
  StateComp,
} from "kaplay";
import { type AggroComp, aggro } from "../comp/Aggro";
import { type SpeedComp, speed } from "../comp/Speed";
import { findDistance } from "../utils";
import type { PlayerComp } from "./Player";

export type EnemyComp = PosComp &
  AreaComp &
  RectComp &
  HealthComp &
  AggroComp &
  SpeedComp &
  StateComp;

export function isEnemy(obj: GameObj): obj is GameObj<EnemyComp> {
  return (obj as GameObj<EnemyComp>).is("enemy");
}

export function addNormalEnemy(
  k: KAPLAYCtx<Record<string, never>, never>,
  x: number,
  y: number,
): GameObj<EnemyComp> {
  return k.add([
    k.pos(x, y),
    k.rect(40, 40),
    k.area(),
    k.health(3),
    aggro(),
    speed(100),
    k.body(),
    k.anchor("center"),
    k.state("idle", ["idle", "stunned", "aggro", "charge", "leap"]),
    "enemy",
  ]);
}

export function addNormalEnemyAvoidPlayer(
  k: KAPLAYCtx<Record<string, never>, never>,
  player: GameObj<PlayerComp>,
): GameObj<EnemyComp> {
  let enemy = addNormalEnemy(k, k.rand(k.width()), k.rand(k.height()));

  while (findDistance(player, enemy) < 400) {
    enemy.destroy();
    enemy = addNormalEnemy(k, k.rand(k.width()), k.rand(k.height()));
  }
  return enemy;
}

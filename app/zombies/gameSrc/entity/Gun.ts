import type { AreaComp, GameObj, KAPLAYCtx, PosComp, RectComp } from "kaplay";

export type GunComp = PosComp & AreaComp & RectComp;

export function addGun(
  k: KAPLAYCtx<Record<string, never>, never>,
): GameObj<GunComp> {
  return k.add([
    k.pos(k.width() - 0.2 * k.width(), k.height() / 2),
    k.rect(40, 40),
    k.color(0, 0, 255),
    k.area(),
    "gun",
  ]);
}

export function addGunWithPos(
  k: KAPLAYCtx<Record<string, never>, never>,
  x: number,
  y: number,
): GameObj<GunComp> {
  return k.add([
    k.pos(x, y),
    k.rect(40, 40),
    k.color(0, 0, 255),
    k.area(),
    "gun",
  ]);
}

import type { KAPLAYCtx } from "kaplay";

export function transitionScene(k: KAPLAYCtx<{}, never>) {
  return k.scene("transition", (numberOfEnemies: number) => {
    k.add([
      k.text(`You survived round ${numberOfEnemies}`),
      k.pos(k.center()),
      k.anchor("center"),
    ]);
    k.add([
      k.text("Click anywhere for the next round"),
      k.pos(k.width() / 2, k.height() / 2 + 50),
      k.scale(0.5),
      k.anchor("center"),
    ]);

    k.onClick(() => {
      k.go("game", numberOfEnemies + 1);
    });
  });
}

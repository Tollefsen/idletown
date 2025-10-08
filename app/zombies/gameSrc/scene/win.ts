import type { KAPLAYCtx } from "kaplay";

export function winScene(k: KAPLAYCtx<{}, never>) {
  return k.scene("win", () => {
    k.add([k.text("You win!"), k.pos(k.center()), k.anchor("center")]);
    k.add([
      k.text("You survived 20 rounds"),
      k.pos(k.width() / 2, k.height() / 2 + 50),
      k.scale(0.5),
      k.anchor("center"),
    ]);
    k.add([
      k.text("Press 'r' to play again"),
      k.pos(k.width() / 2, k.height() / 2 + 100),
      k.scale(0.5),
      k.anchor("center"),
    ]);

    k.onKeyPress("r", () => {
      k.go("game", 1);
    });
  });
}

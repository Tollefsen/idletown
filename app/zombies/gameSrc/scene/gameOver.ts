import type { KAPLAYCtx } from "kaplay";

export function gameOverScene(k: KAPLAYCtx<{}, never>) {
  return k.scene("game over", (numberOfRoundsSurvived: number) => {
    k.add([k.text("Game Over"), k.pos(k.center()), k.anchor("center")]);
    k.add([
      k.text(`${numberOfRoundsSurvived} was one to many`),
      k.pos(k.width() / 2, k.height() / 2 + 50),
      k.scale(0.5),
      k.anchor("center"),
    ]);
    k.add([
      k.text("Press 'r' to restart"),
      k.pos(k.width() / 2, k.height() / 2 + 100),
      k.scale(0.5),
      k.anchor("center"),
    ]);

    k.onKeyPress("r", () => {
      k.go("game", 1);
    });
  });
}

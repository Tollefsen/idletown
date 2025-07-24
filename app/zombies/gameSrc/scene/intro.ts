import type { KAPLAYCtx } from "kaplay";

export function introScene(k: KAPLAYCtx<{}, never>) {
    return k.scene("intro", () => {
        k.add([
            k.text("Avoid the enemies"),
            k.pos(k.width() / 2, k.height() / 3),
            k.anchor("center"),
        ]);

        k.add([
            k.text("Collect the gun"),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
        ]);

        k.add([
            k.text("Go nuts"),
            k.pos(k.width() / 2, (k.height() / 3) * 2),
            k.anchor("center"),
        ]);

        k.add([
            k.text("Click anywhere to start"),
            k.pos(k.width() / 2, (k.height() / 3) * 2 + 100),
            k.scale(0.5),
            k.anchor("center"),
        ]);

        k.onClick(() => {
            k.go("game", 1);
        });
    });
}

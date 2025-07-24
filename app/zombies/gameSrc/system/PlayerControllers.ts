import type { GameObj, KAPLAYCtx, Key, Vec2 } from "kaplay";
import { spawnBulletTowardsMouse } from "../entity/Bullet";
import type { PlayerComp } from "../entity/Player";

export function addPlayerControllers(
    k: KAPLAYCtx<{}, never>,
    player: GameObj<PlayerComp>,
) {

    k.onKeyDown('a', () => {
        if (player.state === "stunned") return;
        player.move(k.LEFT.scale(player.speed));

    });
    k.onKeyDown('d', () => {
        if (player.state === "stunned") return;
        player.move(k.RIGHT.scale(player.speed));
    });
    k.onKeyDown('w', () => {
        if (player.state === "stunned") return;
        player.move(k.UP.scale(player.speed));
    });
    k.onKeyDown('s', () => {
        if (player.state === "stunned") return;
        player.move(k.DOWN.scale(player.speed));
    });

    k.onMousePress(() => {
        if (player.state === "stunned") return;
        spawnBulletTowardsMouse(k, player);
    });

    k.onKeyPress("space", () => {
        if (["stunned", "dash", "cooldown"].includes(player.state)) return;
        player.enterState("dash");
    });
}

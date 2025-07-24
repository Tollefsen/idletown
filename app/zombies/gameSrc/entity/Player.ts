import type {
    AreaComp,
    GameObj,
    HealthComp,
    KAPLAYCtx,
    OpacityComp,
    PosComp,
    StateComp,
} from "kaplay";
import type { HasGunComp } from "../comp/HasGun";
import { type ScoreComp, score } from "../comp/Score";
import { type SpeedComp, speed } from "../comp/Speed";

export type PlayerComp = PosComp &
    AreaComp &
    HasGunComp &
    ScoreComp &
    HealthComp &
    SpeedComp &
    StateComp &
    OpacityComp;

export function isPlayer(obj: GameObj<any>): obj is GameObj<PlayerComp> {
    return (obj as GameObj<PlayerComp>).is("player");
}

export function addDefaultPlayer(k: KAPLAYCtx<{}, never>): GameObj<PlayerComp> {
    return k.add([
        k.pos(0.2 * k.width(), k.height() / 2),
        k.sprite("bean"),
        k.area(),
        k.body(),
        { hasGun: false },
        score(),
        k.health(5),
        speed(320),
        k.state("normal", ["normal", "stunned", "dash", "cooldown"]),
        k.opacity(),
        k.anchor("center"),
        "player",
    ]);
}

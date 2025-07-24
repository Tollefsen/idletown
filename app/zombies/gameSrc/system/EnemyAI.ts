import type { GameObj, KAPLAYCtx, PosComp, TextComp } from "kaplay";
import { isEnemy } from "../entity/Enemy";
import type { PlayerComp } from "../entity/Player";
import { findDirection, findDistance } from "../utils";

export function EnemyAI(
    k: KAPLAYCtx<{}, never>,
    player: GameObj<PlayerComp>,
    score: GameObj<PosComp | TextComp>,
    numberOfEnemies: number,
) {
    const enemies = k.get("enemy");

    enemies.forEach((enemy) => {
        if (!isEnemy(enemy)) return;

        enemy.onDeath(() => {
            k.destroy(enemy);
            player.score++;
            score.text = numberOfEnemies - player.score + "";
        });
        enemy.onStateEnter("stunned", async () => {
            await k.wait(0.3);
            enemy.enterState("aggro");
        });
        enemy.onUpdate(() => {
            if (!player.exists()) return;
            const distanceToplayer = findDistance(enemy, player);

            if (distanceToplayer < 400) {
                enemy.aggro = true;
            }
            if (enemy.aggro && enemy.state !== "stunned") {
                enemy.move(findDirection(enemy, player).unit().scale(enemy.speed));
            }
        });
    });
}

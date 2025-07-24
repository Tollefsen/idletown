import type { KAPLAYCtx } from "kaplay";
import { isEnemy } from "../entity/Enemy";
import { isPlayer } from "../entity/Player";
import { findDirection } from "../utils";

// Bullet hits enemy
export function bulletHitsEnemy(k: KAPLAYCtx<{}, never>) {
    k.onCollide("bullet", "enemy", (bullet, enemy) => {
        enemy.hurt(1);
        enemy.aggro = true;
        bullet.destroy();
    });
}

// Enemy hits player
// TODO: collision triggers twice, why?
export function enemyHitsPlayer(k: KAPLAYCtx<{}, never>) {
    k.onCollide("enemy", "player", (enemy, player) => {
        const dir = findDirection(enemy, player);

        if (!isPlayer(player) || !isEnemy(enemy)) return;
        if (["dash", "stunned"].includes(player.state)) return; //Player takes no damage in some states.
        player.hurt(1);
        player.enterState("stunned");
        enemy.enterState("stunned");
        k.shake(1);

        //Bounce the player away
        player.move(dir.unit().scale(player.speed * 20));
    });
}

// Enemy hits enemy
export function enemyHitsEnemy(k: KAPLAYCtx<{}, never>) {
    k.onCollide("enemy", "enemy", (enemy1, enemy2) => {
        if (!isEnemy(enemy1) || !isEnemy(enemy2)) return;
        // Bounce them away from each other to avail a deadlock
        const dir = findDirection(enemy1, enemy2);
        enemy1.move(dir.unit().scale(-enemy1.speed / 2));
        enemy2.move(dir.unit().scale(enemy2.speed / 2));
    });
}

// Pickup gun
export function playerPicksupGun(k: KAPLAYCtx<{}, never>) {
    k.onCollide("player", "gun", (player, gun) => {
        gun.destroy();
        player.hasGun = true;
    });
}

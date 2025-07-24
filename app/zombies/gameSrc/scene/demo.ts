import type { GameObj, KAPLAYCtx } from "kaplay";
import { type GameStateComp, gameState } from "../comp/Gamestate";
import { addNormalEnemy } from "../entity/Enemy";
import { addGunWithPos } from "../entity/Gun";
import { addDefaultPlayer } from "../entity/Player";
import {
    bulletHitsEnemy,
    enemyHitsPlayer,
    playerPicksupGun,
} from "../system/Collisions";
import { DemoEnemyAI } from "../system/DemoEnemyAI";
import { addDemoPlayerSystem } from "../system/DemoPlayerSystem";
import { addPlayerControllers } from "../system/PlayerControllers";

function getHearthsFromHp(hp: number): string {
    if (hp < 1) return "dead";
    let result = "";
    for (let index = 0; index < hp; index++) {
        result += "+";
    }

    return result;
}

export function isGameState(obj: GameObj<any>): obj is GameObj<GameStateComp> {
    return (obj as GameObj<GameStateComp>).is("gameState");
}

export function getDemoSceneGameState(
    k: KAPLAYCtx<{}, never>,
): GameObj<GameStateComp> {
    const result = k.get("gameState")[0];
    if (!result || !isGameState(result)) {
        return k.add([gameState(), "gameState"]);
    }
    return result;
}

export function addDemoScene(k: KAPLAYCtx<{}, never>) {
    return k.scene("demo", () => {
        const tileSize = 1920;
        const tileScale = 0.1;
        const spriteSize = tileSize * tileScale;

        const numberOfTilesWidth = Math.ceil(k.width() / spriteSize);
        const numberOfTilesHeigth = Math.ceil(k.height() / spriteSize);

        function fillOneScreenWithBackground(startX: number, startY: number) {
            [...Array(numberOfTilesWidth).keys()].forEach((_, widthIndex) => {
                [...Array(numberOfTilesHeigth).keys()].forEach((_, heightIndex) => {
                    k.add([
                        k.sprite("grass"),
                        k.pos(
                            k.toWorld(
                                k.vec2(
                                    startX + widthIndex * spriteSize,
                                    startY + heightIndex * spriteSize,
                                ),
                            ),
                        ),
                        k.scale(tileScale),
                    ]);
                });
            });
        }

        [...Array(6).keys()].forEach((offset) => {
            [...Array(6).keys()].forEach((hOffset) => {
                fillOneScreenWithBackground(
                    -k.width() * offset + k.width() * 3,
                    -k.height() * hOffset + k.height() * 3,
                );
            });
        });

        const player = addDefaultPlayer(k);

        addGunWithPos(k, 400, 400);

        addNormalEnemy(k, k.center().x, k.center().y);

        const myText = k.add([
            k.text(""),
            k.pos(100, 100),
            { health: player.hp() },
            k.fixed(),
            "healthbar",
        ]);

        const score = k.add([
            k.text("0"),
            k.pos(k.width() - 300, 100),
            k.fixed(),
            "score",
        ]);

        addPlayerControllers(k, player);
        addDemoPlayerSystem(k);
        playerPicksupGun(k);
        enemyHitsPlayer(k);
        DemoEnemyAI(k, player);

        bulletHitsEnemy(k);

        k.onUpdate(() => {
            const gameState = getDemoSceneGameState(k);
            myText.text = getHearthsFromHp(player.hp());
            score.text = gameState.playerScore + "";
            console.log(gameState.enemiesKilled);
            if (gameState.enemiesKilled >= gameState.numberOfEnemies) {
                k.go("transition", gameState.numberOfEnemies);
            }
        });
    });
}

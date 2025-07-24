export type GameStateComp = {
    numberOfEnemies: number,
    enemiesKilled: number,
    playerScore: number,
};

export function gameState() {
    return {
        numberOfEnemies: 1,
        enemiesKilled: 0,
        playerScore: 0,
    }
}
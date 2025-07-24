export type SpeedComp = { speed: number };

export function speed(x: number): SpeedComp {
    return {
        speed: x,
    }
}
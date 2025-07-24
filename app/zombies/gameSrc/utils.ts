import type { GameObj, Vec2 } from "kaplay";

export function findDirection(obj1: GameObj, obj2: GameObj): Vec2 {
    const pos1 = obj1.pos;
    const pos2 = obj2.pos;
    return pos2.sub(pos1).unit();
}

export function findDirectionObjToPos(obj: GameObj, pos: Vec2): Vec2 {
    return pos.sub(obj.pos).unit();
}

export function findDistance(obj1: GameObj, obj2: GameObj) {
    return obj1.pos.dist(obj2.pos);
}

export function doXTimes(x: number, fn: Function) {
    for (let index = 0; index < x; index++) {
        fn();
    }
    //Object.keys(Array(x)).forEach(() => fn());
}

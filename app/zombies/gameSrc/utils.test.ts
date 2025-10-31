import type { GameObj, Vec2 } from "kaplay";
import { describe, expect, it, vi } from "vitest";
import {
  doXTimes,
  findDirection,
  findDirectionObjToPos,
  findDistance,
} from "./utils";

describe("findDirection", () => {
  it("should calculate unit vector from obj1 to obj2", () => {
    const mockUnit = vi.fn(() => ({ x: 1, y: 0 }));
    const mockSub = vi.fn(() => ({ unit: mockUnit }));

    const obj1 = {
      pos: { sub: vi.fn() },
    } as unknown as GameObj;
    const obj2 = {
      pos: { sub: mockSub },
    } as unknown as GameObj;

    const result = findDirection(obj1, obj2);

    expect(mockSub).toHaveBeenCalledWith(obj1.pos);
    expect(mockUnit).toHaveBeenCalled();
    expect(result).toEqual({ x: 1, y: 0 });
  });

  it("should return normalized direction vector", () => {
    const mockUnit = vi.fn(() => ({ x: 0.6, y: 0.8 }));
    const mockSub = vi.fn(() => ({ unit: mockUnit }));

    const obj1 = {
      pos: { sub: vi.fn() },
    } as unknown as GameObj;
    const obj2 = {
      pos: { sub: mockSub },
    } as unknown as GameObj;

    const result = findDirection(obj1, obj2);

    expect(result.x).toBeCloseTo(0.6);
    expect(result.y).toBeCloseTo(0.8);
  });
});

describe("findDirectionObjToPos", () => {
  it("should calculate unit vector from object position to target position", () => {
    const mockUnit = vi.fn(() => ({ x: 1, y: 0 }));
    const mockSub = vi.fn(() => ({ unit: mockUnit }));

    const pos: Vec2 = { sub: mockSub } as unknown as Vec2;
    const obj = {
      pos: { x: 0, y: 0 },
    } as unknown as GameObj;

    const result = findDirectionObjToPos(obj, pos);

    expect(mockSub).toHaveBeenCalledWith(obj.pos);
    expect(mockUnit).toHaveBeenCalled();
    expect(result).toEqual({ x: 1, y: 0 });
  });
});

describe("findDistance", () => {
  it("should calculate distance between two objects", () => {
    const mockDist = vi.fn(() => 10);

    const obj1 = {
      pos: { dist: mockDist },
    } as unknown as GameObj;
    const obj2 = {
      pos: { x: 10, y: 0 },
    } as unknown as GameObj;

    const result = findDistance(obj1, obj2);

    expect(mockDist).toHaveBeenCalledWith(obj2.pos);
    expect(result).toBe(10);
  });

  it("should return zero for objects at same position", () => {
    const mockDist = vi.fn(() => 0);

    const obj1 = {
      pos: { dist: mockDist },
    } as unknown as GameObj;
    const obj2 = {
      pos: { x: 0, y: 0 },
    } as unknown as GameObj;

    const result = findDistance(obj1, obj2);

    expect(result).toBe(0);
  });
});

describe("doXTimes", () => {
  it("should execute function x times", () => {
    const fn = vi.fn();

    doXTimes(5, fn);

    expect(fn).toHaveBeenCalledTimes(5);
  });

  it("should not execute function when x is 0", () => {
    const fn = vi.fn();

    doXTimes(0, fn);

    expect(fn).not.toHaveBeenCalled();
  });

  it("should execute function once when x is 1", () => {
    const fn = vi.fn();

    doXTimes(1, fn);

    expect(fn).toHaveBeenCalledOnce();
  });

  it("should execute function in correct order", () => {
    const results: number[] = [];
    let counter = 0;

    doXTimes(3, () => {
      results.push(counter++);
    });

    expect(results).toEqual([0, 1, 2]);
  });
});

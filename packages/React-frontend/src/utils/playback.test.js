import { afterEach, describe, expect, test, vi } from "vitest";
import { createShuffleOrder } from "./playback.js";
import {
    SCREENS,
    assertValidScreen,
} from "../constants/screens.js";

afterEach(() => {
    vi.restoreAllMocks();
})

describe("createShuffleOrder", () => {
    test("includes every track index exactly once", () => {
        const result = createShuffleOrder(4);

        const sortedResult = [...result].sort((a, b) => a - b);

        expect(sortedResult).toEqual([0, 1, 2, 3])
    });

    test("returns an empty array for an empty queue", () => {
        const result = createShuffleOrder(0);

        expect(result).toEqual([]);
    });

    // TDD Test
    test("keeps the currently playing track first", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);

        const result = createShuffleOrder(4, 2);

        expect(result[0]).toBe(2);

        expect([...result].sort((a, b) => a - b))
            .toEqual([0, 1, 2, 3]);
    });
});

describe("assertValidScreen", () => {
    test("accepts a valid application screen", () => {
        expect(() => {
            assertValidScreen(SCREENS.HOME);
        }).not.toThrow();
    });

    test("rejects an invalid application screen", () => {
        expect(() => {
            assertValidScreen("invalid-screen");
        }).toThrow(/Unknown screen/);
    });
});
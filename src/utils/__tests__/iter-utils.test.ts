import { describe, expect, it } from "vitest";
import { pairwise } from "../iter-utils";

describe("pairwise", () => {
    it("yields empty if input array is empty", () => {
        expect(pairwise([]).toArray()).toEqual([]);
    });

    it("yields empty if input array has one element", () => {
        expect(pairwise([1]).toArray()).toEqual([]);
    });

    it("yields items in pairs", () => {
        expect(pairwise([1, 2, 3, 4]).toArray()).toEqual([
            [1, 2],
            [2, 3],
            [3, 4],
        ]);
    });
});

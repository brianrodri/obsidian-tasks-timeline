import { describe, expect, it } from "vitest";

import { Builder } from "./interface-builder";

type RGB = { red: number; green: number; blue: number };
const BLACK: RGB = { red: 0.0, green: 0.0, blue: 0.0 };
const MAGENTA: RGB = { red: 1.0, green: 0.0, blue: 1.0 };
const RED: RGB = { red: 1.0, green: 0.0, blue: 0.0 };
const WHITE: RGB = { red: 1.0, green: 1.0, blue: 1.0 };
const YELLOW: RGB = { red: 1.0, green: 1.0, blue: 0.0 };

describe("Builder", () => {
    it("returns the default value provided", () => {
        expect(new Builder().build(BLACK)).toEqual(BLACK);
    });

    it("prefers input values over default values", () => {
        expect(new Builder(BLACK).build(WHITE)).toEqual(BLACK);
    });

    it("prefers .with() values over default values", () => {
        const blackBuilder = new Builder<RGB>().with("red", 0).with("green", 0).with("blue", 0);
        expect(blackBuilder.build(WHITE)).toEqual(BLACK);
    });

    it("does not mutate after using .with()", () => {
        const redBuilder = new Builder<RGB>().with("red", 1.0);
        expect(redBuilder.with("blue", 1.0).build(BLACK)).toEqual(MAGENTA);
        expect(redBuilder.with("green", 1.0).build(BLACK)).toEqual(YELLOW);
        expect(redBuilder.build(BLACK)).toEqual(RED);
    });

    it("converts to string with JSON format", () => {
        expect(`${new Builder(BLACK)}`).toEqual(`{"red":0,"green":0,"blue":0}`);
    });
});

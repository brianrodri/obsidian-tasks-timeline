import { describe, expect, it } from "vitest";

import { Builder } from "./builder";

type RGB = { red: boolean; green: boolean; blue: boolean };
const BLACK: RGB = { red: false, green: false, blue: false };
const CYAN: RGB = { red: false, green: true, blue: true };
const GREEN: RGB = { red: false, green: true, blue: false };
const WHITE: RGB = { red: true, green: true, blue: true };
const YELLOW: RGB = { red: true, green: true, blue: false };

describe("Builder", () => {
    it("returns default value from build", () => {
        expect(new Builder().build(BLACK)).toEqual(BLACK);
    });

    it("prefers input over default values from build", () => {
        expect(new Builder(GREEN).build(BLACK)).toEqual(GREEN);
    });

    it("prefers .with() over default values from build", () => {
        const greenBuilder = new Builder<RGB>().with("red", false).with("green", true).with("blue", false);
        expect(greenBuilder.build(WHITE)).toEqual(GREEN);
    });

    it("is immutable", () => {
        const greenBuilder = new Builder<RGB>().with("green", true);
        expect(greenBuilder.with("blue", true).build(BLACK)).toEqual(CYAN);
        expect(greenBuilder.with("red", true).build(BLACK)).toEqual(YELLOW);
        expect(greenBuilder.build(BLACK)).toEqual(GREEN);
    });

    it("serializes to JSON", () => {
        expect(`${new Builder(GREEN)}`).toEqual(`{"red":false,"green":true,"blue":false}`);
    });
});

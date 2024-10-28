import { describe, expect, it } from "vitest";

import { splitAtRegExp } from "../regexp-utils";

describe("splitAtRegExp", () => {
    it("returns array with one string if pattern not found", () => {
        const regExp = /[abc]+/g;
        const text = "defghijkl";

        expect(splitAtRegExp(text, regExp).toArray()).toEqual([text]);
    });

    it("returns array with interspersed matches", () => {
        const regExp = /:+/g;
        const text = ":def:::a:ghi::bc:jkl:";

        expect(splitAtRegExp(text, regExp).toArray()).toEqual([
            "",
            ":",
            "def",
            ":::",
            "a",
            ":",
            "ghi",
            "::",
            "bc",
            ":",
            "jkl",
            ":",
            "",
        ]);
    });

    it("asserts input is string", () => {
        expect(() => splitAtRegExp(3 as unknown as string, new RegExp(/^.*$/g)).toArray()).toThrow();
    });

    it("asserts input is RegExp", () => {
        expect(() => splitAtRegExp("5", 3 as unknown as RegExp).toArray()).toThrow();
    });
});

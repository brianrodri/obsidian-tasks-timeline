import { VNode } from "preact";
import { describe, expectTypeOf, it } from "vitest";

import type { WithOverride } from "../with-override";

type RawData = { title: string; items: Array<{ icon: string }> };
type RichData = { items: Array<{ icon: VNode }> };

describe("WithOverride", () => {
    it("overrides the types of specified properties", () => {
        const richData = { title: "Hello, world!", items: [{ icon: <>🐛</> }] };
        expectTypeOf<RawData>().not.toMatchTypeOf(richData);
        expectTypeOf<WithOverride<RawData, RichData>>().toMatchTypeOf(richData);
    });
});

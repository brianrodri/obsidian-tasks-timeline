import { DateTime, Duration } from "luxon";
import { VNode } from "preact";
import { expectTypeOf, it } from "vitest";

import type { WithOverride } from "./with-override";

interface RawData {
    title: string;
    date: string;
    duration: number;
    icon: string;
}

it("overrides the types of specified properties", () => {
    const richData = {
        title: "Hello, world!",
        date: DateTime.now(),
        duration: Duration.fromMillis(0),
        icon: <span class="icon">🐛</span>,
    };

    expectTypeOf<RawData>().not.toMatchTypeOf(richData);
    expectTypeOf<WithOverride<RawData, { date: DateTime; duration: Duration; icon: VNode }>>().toMatchTypeOf(richData);
});

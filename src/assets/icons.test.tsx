import { render } from "@testing-library/preact";
import { expect, test } from "vitest";

import * as Icons from "./icons";

test.each(Object.entries(Icons))("%s is rendered", (_, icon) => {
    expect(() => render(icon)).not.toThrow();
});

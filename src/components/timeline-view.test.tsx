import { render } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";

import { TaskBuilder } from "../compat/dataview-types";
import { useScheduledTasks } from "../hooks/use-scheduled-tasks";
import { TimelineView } from "./timeline-view";

vi.mock("../hooks/use-scheduled-tasks");

describe("TimelineView", () => {
    it("renders unscheduled tasks", () => {
        vi.mocked(useScheduledTasks).mockReturnValue({
            unscheduled: [new TaskBuilder({ text: "task text" }).build()],
            getScheduledOn: () => [],
        });

        const { container } = render(<TimelineView />);

        expect(container.textContent).toContain("task text");
    });
});

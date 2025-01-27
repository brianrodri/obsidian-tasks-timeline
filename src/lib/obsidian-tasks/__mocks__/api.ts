import { vi } from "vitest";

import type { TasksApi as RealTasksApi } from "../api";

const createTaskLineModal = vi.fn();
const executeToggleTaskDoneCommand = vi.fn();

export class TasksApi implements Partial<RealTasksApi> {
    public createTaskLineModal = createTaskLineModal;
    public executeToggleTaskDoneCommand = executeToggleTaskDoneCommand;
}

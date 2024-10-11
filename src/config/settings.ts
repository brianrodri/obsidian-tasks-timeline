export interface TasksTimelineSettings {
    pageQuery: string;
    checked: boolean;
    forward: boolean;
    dailyNoteFolder: string;
    dailyNoteFormat: string;
}

export const DEFAULT_SETTINGS: Readonly<TasksTimelineSettings> = {
    pageQuery: "",
    checked: true,
    forward: true,
    dailyNoteFolder: "01 - Fleeting/01 - Daily",
    dailyNoteFormat: "YYYY-MM-dd",
};

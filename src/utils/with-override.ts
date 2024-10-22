// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithOverride<T, O extends { [K in keyof T]?: any }> = Omit<T, keyof O> & O;

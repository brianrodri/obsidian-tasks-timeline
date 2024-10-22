export type DeepReadonly<T> =
    T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends object ?
        {
            readonly [K in keyof T]: DeepReadonly<T[K]>;
        }
    :   Readonly<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = abstract new (...args: any[]) => T;

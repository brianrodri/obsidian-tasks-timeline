/* v8 ignore next */
import { assign, cloneDeep } from "lodash";

import { DeepReadonly } from "@/utils/type-utils";

export class Builder<T extends object> extends Object {
    private readonly defaults: DeepReadonly<T>;
    private readonly values: Partial<DeepReadonly<T>>;

    public constructor(defaults: T, values: Partial<T> = {}) {
        super();
        this.defaults = cloneDeep(defaults) as DeepReadonly<T>;
        this.values = cloneDeep(values) as DeepReadonly<T>;
    }

    public override toString(): string {
        return JSON.stringify(this.values);
    }

    public with<K extends keyof T>(name: K, value: T[K]): typeof this {
        const constructor = this.constructor as new (_d: DeepReadonly<T>, _v: Partial<DeepReadonly<T>>) => typeof this;
        return new constructor(this.defaults, assign({ ...this.values }, { [name]: value })) as typeof this;
    }

    public build(): T {
        const defaults = cloneDeep(this.defaults) as T;
        const items = cloneDeep(this.values) as Partial<T>;
        return { ...defaults, ...items };
    }
}

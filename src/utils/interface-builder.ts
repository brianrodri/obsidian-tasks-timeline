/* v8 ignore next */
import { assign } from "lodash";

export class Builder<T extends object> extends Object {
    public constructor(private readonly item: Partial<T> = {}) {
        super();
    }

    public override toString(): string {
        return JSON.stringify(this.item);
    }

    public with<K extends keyof T>(name: K, value: T[K]): typeof this {
        // @ts-expect-error this.constructor is a constructor but its type is Function.
        return new this.constructor(assign({ ...this.item }, { [name]: value })) as typeof this;
    }

    public build(defaults: T): T {
        return assign({ ...defaults }, this.item);
    }
}

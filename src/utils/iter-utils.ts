/**
 * Return successive overlapping pairs taken from the input iterable.
 *
 * The number of 2-tuples in the output iterator will be one fewer than the number of inputs. It will be empty if the
 * input iterable has fewer than two values.
 */
export function* pairwise<T>(items: T[]) {
    for (let i = 0; i < items.length - 1; ++i) {
        yield items.slice(i, i + 2) as [T, T];
    }
}

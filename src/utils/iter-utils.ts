/**
 * Return successive overlapping pairs taken from the input iterable.
 *
 * The number of 2-tuples in the output iterator will be one fewer than the number of inputs. It will be empty if the
 * input iterable has fewer than two values.
 */
export function* pairwise<T>(iterable: Iterable<T>) {
    const [head, ...tail] = iterable;
    let curr = head;
    for (const next of tail) {
        yield [curr, next] as const;
        curr = next;
    }
}

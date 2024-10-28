import { isRegExp, isString } from "lodash";

import { pairwise } from "@/utils/iter-utils";

export function* splitAtRegExp(text: string, regExp: RegExp) {
    if (!isString(text)) throw new Error(`want string, got: ${text}`);
    if (!isRegExp(regExp)) throw new Error(`want RegExp, got: ${regExp}`);

    const matches = [...text.matchAll(regExp), /$/.exec(text) as RegExpExecArray];

    yield text.slice(0, matches[0].index);
    for (const [curr, next] of pairwise(matches)) {
        yield curr[0];
        yield text.slice(curr.index + curr[0].length, next.index);
    }
}

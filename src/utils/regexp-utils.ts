import { isRegExp, isString } from "lodash";

import { pairwise } from "@/utils/iter-utils";

export function splitAtRegExp(text: string, regExp: RegExp) {
    if (!isString(text)) throw new Error(`want string, got: ${text}`);
    if (!isRegExp(regExp)) throw new Error(`want RegExp, got: ${regExp}`);

    const matches = [...text.matchAll(regExp), /$/.exec(text) as RegExpExecArray];

    return [
        text.slice(0, matches[0].index),
        ...pairwise(matches).flatMap(([curr, next]) => [curr[0], text.slice(curr.index + curr[0].length, next.index)]),
    ];
}

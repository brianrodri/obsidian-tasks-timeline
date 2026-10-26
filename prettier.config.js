/** @type {import("prettier").Config} */
export default {
    plugins: ["@trivago/prettier-plugin-sort-imports"],
    printWidth: 120,
    tabWidth: 4,
    trailingComma: "all",
    semi: true,
    useTabs: false,
    experimentalTernaries: true,
    importOrder: ["<THIRD_PARTY_MODULES>", "^@/(.*)$", "^[./]"],
    importOrderSideEffects: false,
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
};

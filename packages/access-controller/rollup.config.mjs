import vuePlugin from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';

import fs from 'fs';
import path from 'path';

const getPath = (_path) => path.resolve(process.cwd(), _path);

function externalFiles() {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './package.json'),));
    return [
        /@vue\/composition-api/,
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ]
}
/**
 * @returns {import('rollup').Plugin}
 */
function vueTransformPlugin(isVue2) {
    return {
        resolveId(source) {
            if (/vue-demi/.test(source)) {
                console.log("isVue2", isVue2, source);
                if (isVue2) {
                    return getPath("./src/vue-demi/v2/index.mjs");
                } else {
                    return getPath("./src/vue-demi/v3/index.mjs");
                }
            }
        },
    };
}

export default {
    external: externalFiles(),
    input: "./src/index.ts",
    output: [
        {
            dir: `dist`,
            format: "esm",
            globals: {
                vue: "Vue",
            },
        },
    ],
    plugins: [
        vuePlugin({
            css: true,
            style: {
                preprocessOptions: {
                    less: {
                        javascriptEnabled: true,
                    },
                },
            },
        }),
        postcss({
            // extract: "index.css",
            extensions: [".css", ".less"],
            use: [
                [
                    "less",
                    {
                        javascriptEnabled: true,
                    },
                ],
            ],
        }),
        vueTransformPlugin(true),
        typescript({
            tsconfig: getPath("./tsconfig.json"), // 导入本地ts配置
            extensions: [".js", ".ts"],
            clear: true,
            tsconfigOverride: {
                compilerOptions: { declaration: true },
            },
        }),
        resolve(),
        commonjs({}),
        babel({
            exclude: "**/node_modules/**",
        }),
    ],
};

import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/scripts/scripts.js",
  output: {
    file: "public/scripts/bundle.js",
    format: "iife",
    sourcemap: process.env.ENVIRONMENT !== "production",
  },
  plugins: [nodeResolve(), commonjs(), terser()],
};

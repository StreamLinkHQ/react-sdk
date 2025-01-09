import { defineConfig } from "tsup";

export default defineConfig({
  entry: ['src/index.ts'],
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
    compilerOptions: {
      moduleResolution: "node",
      jsx: "react-jsx"
    }
  },
  splitting: false,
  sourcemap: false, // Disable source maps
  clean: true,
  treeshake: true,
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  external: ["react", "react-dom"],
  noExternal: ['style-loader', 'css-loader']
});

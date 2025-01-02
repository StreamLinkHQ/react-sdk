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
  sourcemap: true,
  clean: true,
  treeshake: true,
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
  external: ["react", "react-dom"],
  // Add these options
  noExternal: ['style-loader', 'css-loader'],
  injectStyle: true, // This will inject styles into JS bundle
})
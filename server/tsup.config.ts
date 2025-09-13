import { defineConfig } from "tsup";

export default defineConfig({
  entry: ['./src/pkg/index.ts'],
  dts: {
    only: true
  },
  outDir: '../client/dist'
})

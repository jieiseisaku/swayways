import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// dev:   npm run dev      → http://localhost:5173 (HMR, edit JSON/JS and see it instantly)
// build: npm run build    → dist/  (browser-runnable; index.html is self-contained,
//                                    the hint_*.svg files sit alongside it)
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
});

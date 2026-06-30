import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  // ponytail: base:'/' بدل './' السابقة — './' تولّد مسارات assets نسبية
  // (./assets/index.js) تُحسب من URL الحالي، فحين تُنشر على دومين وتُفتح
  // صفحة داخلية مباشرةً (/about) يبحث المتصفح عن /about/assets/... (خطأ).
  // '/' تولّد مسارات مطلقة (/assets/index.js) تعمل من أي مسار في الدومين.
  base: '/',
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {},
});

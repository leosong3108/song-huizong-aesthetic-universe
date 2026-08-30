import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages 部署在 https://<user>.github.io/<repo>/ 下，需要设置 base。
// 本地 dev 保持 "/"。可通过环境变量 VITE_BASE 覆盖。
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base:
    process.env.VITE_BASE ??
    (command === "build" ? "/song-huizong-aesthetic-universe/" : "/"),
}));

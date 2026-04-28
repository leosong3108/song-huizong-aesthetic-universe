# 宋徽宗的审美宇宙

一个以宋徽宗与宋代审美为主题的交互式可视化实验。项目用真实馆藏数据和作品缩略图构建一个 3D 宇宙式博物馆界面：点击作品可居中放大，拖拽可旋转空间，触控板捏合可缩放。

## 本地运行

```bash
npm install
npm run dev -- --port 5188
```

打开 `http://localhost:5188/`。

## 构建

```bash
npm run build
```

## 数据

- `public/song-huizong-artifacts-core-plus.json`：前端使用的作品数据。
- `public/artifacts/thumbs/`：缓存的作品缩略图。
- `data/`：原始抓取与整理后的数据文件。
- `scripts/`：数据抓取与缩略图缓存脚本。


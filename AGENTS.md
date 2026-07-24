# Yami RPG Editor — 项目规范

本文件为 AI 协作约定，描述项目结构、构建流程、迁移规范与禁忌操作。
所有 agent 在动手前必须读完本文件。

## 1. 项目概览

- **名称**：yami-rpg-editor（2D Game Editor）
- **运行平台**：Electron 28 / Chromium 90（Windows / macOS / Linux）
- **包管理器**：`pnpm@10.13.1`（禁止使用 npm / yarn）
- **源码根目录**：`Project/`
- **编辑器主入口**：`Project/index.src.html`（由 `scripts/build-html.js` 拼装为 `index.html`）
- **渲染进程脚本目录**：`Project/Script/`（491 个模块，ESM）

## 2. 模块系统约定

- 渲染进程使用 **ESM**：`<script type="module">` + `Project/Script/main/module-init.js`（自动生成）。
- `module-init.js` 由 `scripts/build-module.js` 从 `Project/html/head.html` 中的 `<script src="Script/...">` 列表生成 import 顺序。
- **禁止**手动编辑 `module-init.js`——它是 `pnpm buildmodule` 的产物。
- `head.html` 是模块加载顺序的 **单一事实来源**（SOT）；新增模块必须在 head.html 中按依赖顺序插入。

## 3. 迁移规范：Project/Script/**/*.js → .ts（TypeScript 7）

### 3.1 总体策略

- **结构迁移优先**：先批量 `.js` → `.ts` 重命名 + 同步 import 路径扩展名，再做渐进式类型化。
- **类型检查与编译分离**：`tsc --noEmit` 仅做类型检查；实际 TS→JS 编译由 Vite 8 在 `pnpm start` / `pnpm dev` / `pnpm build:vite` 时完成。
- **不允许 JS/TS 混源**：`Project/Script/` 内所有源文件统一为 `.ts`；`allowJs: false`。

### 3.2 tsconfig.json 规范

- `target: "es2022"`，`module: "esnext"`，`moduleResolution: "bundler"`
- `allowImportingTsExtensions: true`（TS 7 原生支持 `.ts` 扩展名 import）
- `noEmit: true`（tsc 不产出 JS，仅类型检查）
- `strict: false`（迁移期渐进开启，避免一次性爆错）
- `include: ["Project/Script/**/*.ts"]`
- `exclude: ["Project/Templates/**", "node_modules/**", "dist/**", "build/**", "main/**"]`

### 3.3 import 路径规范

- 相对路径 import / export **必须带 `.ts` 扩展名**（与原 `.js` 扩展名习惯一致，便于 Vite 解析）。
- 裸说明符（`monaco-editor`、`electron`、`axios`、`fs-extra`、`yauzl`、`markdown-it`、`uglify-js`）保持无扩展名，由 `head.html` 的 importmap 桥接（`window.__nodeRequire`）。
- **禁止**：无扩展名相对路径 import（TS 7 `allowImportingTsExtensions` 下不允许省略扩展名）。

### 3.4 构建脚本兼容规范

- `scripts/build-module.js`：`realEsmExclude` 集合内的路径 **必须使用 `.ts` 后缀**（与重命名后的实际文件匹配）；正则 `src="(Script/[^"]+)"` 已兼容 `.ts`。
- `scripts/verify-imports.js`：文件遍历过滤从 `endsWith('.js')` 改为 `/\.(js|ts)$/`；import 解析兼容 `.ts`。

### 3.5 迁移禁忌

- **禁止**手动逐文件重命名——必须用一次性脚本批量执行，保证原子性与可回滚。
- **禁止**在迁移过程中修改任何业务逻辑——结构迁移与逻辑修改必须分离 commit。
- **禁止**修改 `Project/Script/vs/`（monaco 手动源码，仍是 AMD `.js`，不属于本次范围）。
- **禁止**修改 `Project/Templates/` 下的任何 `.ts` 文件（游戏模板，非编辑器源码）。
- **禁止**修改 `main/*.js`（Electron 主进程，CommonJS，不在本次范围）。

### 3.6 渐进式类型化顺序（阶段 4，后续多轮）

依赖底向上，按以下顺序逐目录加类型注解：

1. `Script/util/`（最底层工具函数）
2. `Script/components/`（UI 组件基础）
3. `Script/command/`（命令系统）
4. `Script/scene/` / `Script/animation/` / `Script/particle/`（编辑器子系统）
5. `Script/main/` / `Script/title/`（应用入口）
6. 其余目录

每个目录加完类型后，必须运行 `pnpm typecheck` 与 `pnpm verify-imports` 验证。

## 4. 构建与验证命令

| 命令                  | 用途                                                          |
| --------------------- | ------------------------------------------------------------- |
| `pnpm buildcss`       | 由 `Project/css/*.css` 拼装 `Project/index.css`               |
| `pnpm buildmodule`    | 由 `head.html` 生成 `module-init.js`，注入 export/window 绑定 |
| `pnpm buildhtml`      | 由 `index.src.html` 拼装 `index.html`（含 importmap 桥）      |
| `pnpm verify-imports` | 校验所有相对 import 路径与导出符号闭合                        |
| `pnpm smoke`          | 冒烟测试（语法 + 模块加载）                                   |
| `pnpm typecheck`      | tsc --noEmit 类型检查（迁移后新增）                           |
| `pnpm start`          | 启动 Electron 编辑器（file:// 协议加载 Project/）             |
| `pnpm dev`            | Vite dev server 模式（端口 5173）                             |

## 5. 工作流约定

- **提交规范**：不允许自动提交，需要手动提交。
- **文件操作**：禁止用 `bash sed -i` / `bash echo >>` 改文件——必须用 `edit_file` / `write_file`。
- **目录操作**：禁止用 `bash ls` / `bash find`——必须用 `list_directory` / `glob`。
- **内容搜索**：禁止用 `bash grep` / `bash rg`——必须用 `grep`。

## 6. 平台与路径约定

- 开发环境：Windows（Git Bash）
- 路径分隔符：脚本内统一用 `/`（POSIX）；Windows 绝对路径用 `C:/Users/...` 形式
- 换行符：`.prettierrc.json` 强制 `endOfLine: lf`
- 缩进：`useTabs: true`，`tabWidth: 4`（prettier 强制）

## 7. 重要文件清单（动手前必读）

| 文件                                 | 作用                                                 |
| ------------------------------------ | ---------------------------------------------------- |
| `Project/html/head.html`             | 模块加载顺序 SOT（`<script src="Script/...">` 列表） |
| `Project/index.src.html`             | HTML 入口模板（含 `<!--#include-->` 指令）           |
| `Project/Script/main/module-init.js` | 自动生成的 import 入口（禁止手改）                   |
| `scripts/build-module.js`            | 生成 module-init.js + 注入 export/window 绑定        |
| `scripts/build-html.js`              | 拼装 index.html + 注入 importmap 桥                  |
| `scripts/verify-imports.js`          | 校验 import 闭合（迁移后兼容 .ts）                   |
| `vite.config.js`                     | Vite 8 配置（root: Project, target: chrome150）      |
| `tsconfig.json`                      | TS 7 类型检查配置（迁移后新增）                      |

## 8. 已知陷阱

1. **`realEsmExclude` 集合（约 480 条）**：列出了已完成"真 ESM 改造"的文件，`build-module.js` 会跳过这些文件的 export/window 绑定注入。迁移 `.ts` 后必须同步更新该集合的扩展名。
2. **Electron file:// 协议**：`vite.config.js` 的 `base: './'` 是为 Electron file:// 协议设计的；改 chunk 命名时必须保持相对路径。
3. **`monaco-editor` 载入方式**：已由 pnpm 包 `import * as monaco from 'monaco-editor'` 载入，删 `Project/Script/vs/` 手动源码。`window.monaco` 不再绑定。
4. **node: 协议说明符**：渲染进程 ESM 不认 `node:fs` 等，必须走 `head.html` 的 importmap data URL 桥（`window.__nodeRequire`）。
5. **`module-init.js` 含 monaco 顶部 import**：`build-module.js` 会 `unshift("import * as monaco from 'monaco-editor'")`；手动编辑该文件会被下次 build 覆盖。

## 9. 回滚预案

- 阶段 2 的批量重命名在一个 commit 内，可通过 `git revert <commit>` 整体回退。
- 若 Vite 不识别 `.ts` 入口，立即回退 `head.html` 和 `module-init.js` 的扩展名。
- 若 `pnpm typecheck` 爆出非预期错误（如 TS 7 nightly bug），可临时把 `tsconfig.json` 的 `include` 缩为空数组，不阻断主流程。

---

**最后更新**：2026-07-21（refactor/esm 分支，Project/Script .js→.ts 迁移启动）

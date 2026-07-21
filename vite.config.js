import { defineConfig } from 'vite';
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync
} from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

// 递归复制目录（保留 monaco vs/ 等静态资源到 dist）
const copyDirRecursive = (src, dest) => {
	if (!existsSync(src)) return;
	mkdirSync(dest, { recursive: true });
	for (const name of readdirSync(src)) {
		const srcPath = join(src, name);
		const destPath = join(dest, name);
		if (statSync(srcPath).isDirectory()) {
			copyDirRecursive(srcPath, destPath);
		} else {
			copyFileSync(srcPath, destPath);
		}
	}
};

// 将 Project/ 下需原样输出到 dist/ 的非 JS/CSS 静态资源复制到 outDir
// Vite 只 bundle JS/CSS/HTML，vs/（monaco）、Locales/、Fonts/、Images/、
// Templates/、Apk/、default.json、commands.json 等需原样复制
const copyStaticAssets = (outDir) => {
	const root = resolve(__dirname, 'Project');
	// monaco-editor 改由 pnpm 包载入（module-init.js import 'monaco-editor'），删 'vs' 目录复制
	// 'Script'：global.js 载 packmeta.json + 各模块运行时读 Script/ 下源（deploy 打包后游戏本体亦需）
	const staticDirs = [
		'Script',
		'Locales',
		'Fonts',
		'Images',
		'Templates',
		'Apk'
	];
	const staticFiles = ['default.json', 'commands.json'];
	for (const dir of staticDirs) {
		copyDirRecursive(join(root, dir), join(outDir, dir));
	}
	for (const file of staticFiles) {
		const src = join(root, file);
		if (existsSync(src)) copyFileSync(src, join(outDir, file));
	}
};

export default defineConfig({
	// 源码在 Project/，Electron loadFile 用 file:// 协议，相对路径
	root: 'Project',
	base: './',

	// 入口由 build-html.js 从 index.src.html 拼生成 index.html
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
		// Electron file:// 协议下，chunkFilename 必须是相对路径
		rollupOptions: {
			input: resolve(__dirname, 'Project/index.html'),
			// ESM import 'electron' / 'node:fs' 等走运行时 Electron renderer require 解析（nodeIntegration:true 启）；
			// 不 externalize 则 vite build 报「Could not resolve 'electron'」
			external: [
				'electron',
				'node:fs',
				'node:path',
				'node:url',
				'node:os',
				'node:child_process',
				'axios',
				'fs-extra',
				'yauzl',
				'uglify-js',
				'markdown-it'
			],
			output: {
				entryFileNames: 'assets/[name].js',
				chunkFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]'
			}
		},
		minify: false,
		sourcemap: true
	},

	// dev server 配置——Electron 渲染进程 loadURL('http://localhost:5173')
	server: {
		host: 'localhost',
		port: 5173,
		strictPort: true,
		cors: true,
		proxy: {
			// axios 跨域请求 GitHub raw + jsdelivr CDN 加速节点时，浏览器 CORS 政策拒收；
			// dev 模式走 Vite 代理避 CORS（prod 模式 Electron file:// 协议无 CORS 限制）
			// raw.githubusercontent.com：resource.js checkVersion/downloadNetMeta 载 pack.json/packmeta.json
			'^/github-raw/': {
				target: 'https://raw.githubusercontent.com',
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/github-raw\//, '/')
			},
			// cdn.jsdelivr.net：resource.js 载 fastGithubArray.json + 加速节点镜像
			'^/jsdelivr/': {
				target: 'https://cdn.jsdelivr.net',
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/jsdelivr\//, '/')
			}
		}
	},

	// 路径别名——与现有 ESM import 路径无关，但保留常用别名
	resolve: {
		alias: {
			'@': resolve(__dirname, 'Project/Script')
		}
	},

	// 静态资源原样输出（不经过 Vite bundle）
	publicDir: false, // 关闭默认 public/，用插件手动复制

	plugins: [
		// 解析 electron/axios 等 Node 模块——渲染进程 ESM import 走 window.__nodeRequire 桥
		// Electron nodeIntegration:true 下 renderer 可以 require('electron')/require('axios')
		// 但 ESM import 'electron' 被 Vite 拦截找不到模块，把 electron 和 axios 的 import 替换为 data URL 桥模块
		{
			name: 'electron-renderer-resolve',
			transform(code, id) {
				if (
					!id.endsWith('.ts') &&
					!id.endsWith('.js') &&
					!id.endsWith('.mjs')
				)
					return;
				const b64 = (src) =>
					'data:text/javascript;base64,' +
					Buffer.from(src).toString('base64');
				// 所有裸说明符（node_modules 包）走 window.__nodeRequire 桥接，避免 Vite 预构建破坏 CJS 内部 require
				// monaco-editor 桥接：源码用 `import * as monaco from 'monaco-editor'`
				// 注：monaco 不桥接——其 main 入口为 AMD（define），module 入口为 ESM；
				// 走 ESM 入口让 Vite 正常处理，避免运行时 ReferenceError: define is not defined
				const bareModules = {
					electron: `const e = window.__nodeRequire?.('electron') ?? {}; export const { clipboard, ipcRenderer, shell, webFrame } = e; export default e`,
					axios: `const a = window.__nodeRequire?.('axios') ?? {}; export default a`,
					'markdown-it': `const M = window.__nodeRequire?.('markdown-it') ?? {}; export default M`,
					'fs-extra': `const f = window.__nodeRequire?.('fs-extra') ?? {}; export default f`,
					yauzl: `const y = window.__nodeRequire?.('yauzl') ?? {}; export default y`,
					'uglify-js': `const u = window.__nodeRequire?.('uglify-js') ?? {}; export default u`
				};
				// node:* 内建模块：浏览器端不可用，走 window.__nodeRequire 桥接
				const nodeModules = {
					'node:path': `const p = window.__nodeRequire?.('path') ?? {}; export default p; export const { sep, delimiter, posix, win32, resolve, normalize, isAbsolute, join, relative, dirname, basename, extname, parse, format } = p`,
					'node:fs': `const f = window.__nodeRequire?.('fs') ?? {}; export default f; export const { promises, existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync, unlinkSync, copyFileSync, renameSync } = f`,
					'node:os': `const o = window.__nodeRequire?.('os') ?? {}; export default o; export const { homedir, platform, tmpdir, hostname, cpus, totalmem, freemem, EOL } = o`,
					'node:url': `const u = window.__nodeRequire?.('url') ?? {}; export default u; export const { fileURLToPath, URL, pathToFileURL, format, parse, resolve } = u`,
					'node:child_process': `const c = window.__nodeRequire?.('child_process') ?? {}; export default c; export const { exec, execSync, spawn, spawnSync, fork } = c`
				};
				let out = code;
				const escapeRe = (s) =>
					s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				for (const [mod, src] of Object.entries({
					...bareModules,
					...nodeModules
				})) {
					const dataUrl = b64(src);
					out = out
						.replace(
							new RegExp(`from\\s+['"]${escapeRe(mod)}['"]`, 'g'),
							`from '${dataUrl}'`
						)
						.replace(
							new RegExp(
								`import\\s+['"]${escapeRe(mod)}['"]`,
								'g'
							),
							`import '${dataUrl}'`
						);
				}
				return out;
			}
		},
		{
			name: 'copy-static-assets',
			// buildFinished 钩子：把 vs/、Locales/、Templates/ 等原样复制到 dist/
			closeBundle() {
				const outDir = resolve(__dirname, 'dist');
				copyStaticAssets(outDir);
			}
		},
		// /local-file/?path= 本地文件代理——File.route dev 模式改写后走这里读磁盘。
		// vite dev server 没有 server.middleware 字段（非官支持），自定义 middleware 必须走
		// plugin 的 configureServer 钩子注入 server.middlewares（connect 实例）。
		// 匹配 /local-file/ 路径直接读磁盘回二进制，不走 proxy 链避 target 校验。
		// 不返 post 钩子直接注入——让 middleware 在内部 middleware（htmlFallback/notFound）之前
		// 先拦 /local-file/，否则 htmlFallback 抢先回 index.html 致 Image.src 拿 HTML 解析失败
		{
			name: 'local-file-proxy',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					if (!req.url?.startsWith('/local-file/')) {
						return next();
					}
					const url = new URL(req.url, 'http://localhost');
					const path = url.searchParams.get('path');
					if (!path) {
						res.statusCode = 400;
						res.end('Missing path param');
						return;
					}
					// path 可能是 file:// URL 或裸磁盘路径，剥 file:// 前缀取磁盘绝对路径
					// ver cache-bust 段：File.route dev 段把 ?ver= 改写成 #ver= fragment 避被 URL 当 query 分隔，
					// URL 解析时 # 后算 hash 不进 searchParams，故 path 值末尾可能含 #ver=123 段需剥
					// 双斜杠兜底：File.route/File.path 入口已剥，但残留时正则剥掉连续斜杠避 ENOENT
					const diskPath = (
						path.startsWith('file://')
							? fileURLToPath(path)
							: path.replace(/[#?]ver=\d+$/, '')
					).replace(/[\\/]{2,}/g, '/');
					try {
						const buf = readFileSync(diskPath);
						res.setHeader(
							'Content-Type',
							'application/octet-stream'
						);
						res.setHeader('Access-Control-Allow-Origin', '*');
						res.end(buf);
					} catch (error) {
						res.statusCode = 404;
						res.end(`File not found: ${diskPath}`);
					}
				});
			}
		}
	],

	// 依赖预构建——axios 等 node_modules 包
	// electron 不预构建：由 electron-renderer-resolve 插件提供 data URL 桥接模块
	optimizeDeps: {
		include: ['axios'],
		exclude: ['electron']
	},

	// Electron 渲染进程 nodeIntegration:true，需兼容 CommonJS require
	define: {
		'process.env.NODE_ENV': JSON.stringify(
			process.env.NODE_ENV || 'production'
		)
	},

	// 旧 Electron 20 + Chromium 90，不踩 esbuild target 语法下限
	oxc: {
		target: 'chrome90'
	}
});

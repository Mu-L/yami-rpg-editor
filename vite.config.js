import { defineConfig } from 'vite';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

// 递归复制目录（保留静态资源到 dist）
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

// 将 Project/ 下需原样输出的静态资源复制到 dist/
const copyStaticAssets = (outDir) => {
	const root = resolve(__dirname, 'Project');
	const staticDirs = ['Locales', 'Fonts', 'Images', 'Templates', 'Apk'];
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
	root: 'Project',
	base: './',

	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
		rollupOptions: {
			input: resolve(__dirname, 'Project/index.html'),
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

	server: {
		host: 'localhost',
		port: 5173,
		strictPort: true,
		cors: true,
		proxy: {
			// dev 模式走 Vite 代理避 CORS（prod 模式 file:// 协议无 CORS 限制）
			'^/github-raw/': {
				target: 'https://raw.githubusercontent.com',
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/github-raw\//, '/')
			},
			'^/jsdelivr/': {
				target: 'https://cdn.jsdelivr.net',
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/jsdelivr\//, '/')
			}
		}
	},

	resolve: {
		alias: {
			'@': resolve(__dirname, 'Project/Script')
		}
	},

	publicDir: false,

	plugins: [
		{
			name: 'electron-renderer-resolve',
			transform(code, id) {
				if (!id.endsWith('.ts') && !id.endsWith('.js') && !id.endsWith('.mjs')) return;
				const b64 = (src) =>
					'data:text/javascript;base64,' + Buffer.from(src).toString('base64');
				const bareModules = {
					electron: `const e = window.__nodeRequire?.('electron') ?? {}; export const { clipboard, ipcRenderer, shell, webFrame } = e; export default e`,
					axios: `const a = window.__nodeRequire?.('axios') ?? {}; export default a`,
					'markdown-it': `const M = window.__nodeRequire?.('markdown-it') ?? {}; export default M`,
					'fs-extra': `const f = window.__nodeRequire?.('fs-extra') ?? {}; export default f`,
					yauzl: `const y = window.__nodeRequire?.('yauzl') ?? {}; export default y`,
					'uglify-js': `const u = window.__nodeRequire?.('uglify-js') ?? {}; export default u`
				};
				const nodeModules = {
					'node:path': `const p = window.__nodeRequire?.('path') ?? {}; export default p; export const { sep, delimiter, posix, win32, resolve, normalize, isAbsolute, join, relative, dirname, basename, extname, parse, format } = p`,
					'node:fs': `const f = window.__nodeRequire?.('fs') ?? {}; export default f; export const { promises, existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync, unlinkSync, copyFileSync, renameSync } = f`,
					'node:os': `const o = window.__nodeRequire?.('os') ?? {}; export default o; export const { homedir, platform, tmpdir, hostname, cpus, totalmem, freemem, EOL } = o`,
					'node:url': `const u = window.__nodeRequire?.('url') ?? {}; export default u; export const { fileURLToPath, URL, pathToFileURL, format, parse, resolve } = u`,
					'node:child_process': `const c = window.__nodeRequire?.('child_process') ?? {}; export default c; export const { exec, execSync, spawn, spawnSync, fork } = c`
				};
				let out = code;
				const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
							new RegExp(`import\\s+['"]${escapeRe(mod)}['"]`, 'g'),
							`import '${dataUrl}'`
						);
				}
				return { code: out, map: null };
			}
		},
		{
			name: 'copy-static-assets',
			closeBundle() {
				const outDir = resolve(__dirname, 'dist');
				copyStaticAssets(outDir);
			}
		},
		// dev 模式走 /local-file/?path= 代理绕过 file:// 限制
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
					const diskPath = (
						path.startsWith('file://')
							? fileURLToPath(path)
							: path.replace(/[#?]ver=\d+$/, '')
					).replace(/[\\/]{2,}/g, '/');
					try {
						const buf = readFileSync(diskPath);
						res.setHeader('Content-Type', 'application/octet-stream');
						res.setHeader('Access-Control-Allow-Origin', '*');
						res.end(buf);
					} catch {
						res.statusCode = 404;
						res.end(`File not found: ${diskPath}`);
					}
				});
			}
		}
	],

	optimizeDeps: {
		include: ['axios'],
		exclude: ['electron']
	},

	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
	},

	oxc: {
		target: 'chrome150'
	}
});

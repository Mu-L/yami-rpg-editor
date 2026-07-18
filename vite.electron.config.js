import { defineConfig } from 'vite'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

// Electron 主进程 ESM bundle 配置——与渲染进程的 vite.config.js 分开
// 主进程是 Node ESM（Electron 12+ 支持），输出到 dist-electron/
// 入口：main/main.js（主进程）+ main/apk.js（APK 处理器，被 main.js import）
export default defineConfig({
	mode: 'production',
	base: './',

	build: {
		outDir: 'dist-electron',
		emptyOutDir: true,
		// 用 rollupOptions 多入口（不用 lib，lib 单入口对多入口支持差）
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'main/main.js'),
				apk: resolve(__dirname, 'main/apk.js')
			},
			output: {
				// ESM format（package.json type:module 后 .js 即 ESM）
				format: 'es',
				entryFileNames: '[name].js',
				// 主进程 Electron file:// 协议下用相对 chunk 路径
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]'
			},
			// external 掉所有 npm 包和 electron + Node 内建模块——
			// 主进程 runtime 用 Node require 解析（ESM 下 createRequire(import.meta.url) 桥）
			external: [
				'electron',
				'fs',
				'path',
				'os',
				'url',
				'util',
				'child_process',
				'http',
				'https',
				'node:fs',
				'node:path',
				'node:os',
				'node:url',
				'node:util',
				'node:child_process',
				'node:http',
				'node:https',
				'koa',
				'mime-types',
				'qrcode',
				'exceljs',
				'xml2js',
				'sharp'
			]
		},
		// 主进程不 minify（保留函数名便于调试栈）
		minify: false,
		sourcemap: true,
		chunkSizeWarningLimit: 2000
	},

	// Node ESM target——Electron 20 内置 Node 20
	esbuild: {
		target: 'node20',
		platform: 'node',
		format: 'es'
	},

	// 主进程用 Node API，define process.env
	define: {
		'process.env.NODE_ENV': JSON.stringify('production')
	},

	plugins: [
		{
			name: 'emit-electron-package-json',
			// emptyOutDir:true 会清掉 dist-electron/，手动加的 package.json 不持久；
			// 用 closeBundle 钩子 build 完后自动生成 {"type":"module"}，让 Electron 28 把
			// dist-electron/main.js 当 ESM 载（否则报 Cannot use import statement outside a module）
			closeBundle() {
				writeFileSync(
					resolve(__dirname, 'dist-electron/package.json'),
					'{\n\t"type": "module"\n}\n'
				)
			}
		}
	]
})

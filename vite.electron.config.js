import { defineConfig } from 'vite';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

// Electron 主进程 ESM bundle 配置——与渲染进程分开，输出到 dist-electron/
export default defineConfig({
	mode: 'production',
	base: './',

	build: {
		outDir: 'dist-electron',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'main/main.ts'),
				apk: resolve(__dirname, 'main/apk.ts')
			},
			output: {
				format: 'es',
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]'
			},
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
		minify: false,
		sourcemap: true,
		chunkSizeWarningLimit: 2000
	},

	esbuild: {
		target: 'node20',
		platform: 'node',
		format: 'es'
	},

	plugins: [
		{
			name: 'emit-electron-package-json',
			// build 完后自动生成 {"type":"module"}，使 Electron 把 main.js 当 ESM 载入
			closeBundle() {
				writeFileSync(
					resolve(__dirname, 'dist-electron/package.json'),
					'{\n\t"type": "module"\n}\n'
				);
			}
		}
	]
});

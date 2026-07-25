import { defineConfig } from 'vite';
import { resolve } from 'path';

// Electron 主进程 CommonJS bundle 配置——与渲染进程分开，输出到 dist-electron/
export default defineConfig({
	mode: 'production',
	base: './',

	build: {
		outDir: 'dist-electron',
		emptyOutDir: true,
		rolldownOptions: {
			input: {
				main: resolve(__dirname, 'main/main.ts'),
				apk: resolve(__dirname, 'main/apk.ts')
			},
			output: {
				format: 'cjs',
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
		minify: true,
		sourcemap: true,
		chunkSizeWarningLimit: 2000
	},

	esbuild: {
		target: 'node20',
		platform: 'node'
	}
});

const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..', 'Project');

const srcFile = path.join(projectDir, 'index.src.html');
const outFile = path.join(projectDir, 'index.html');

if (!fs.existsSync(srcFile)) {
	console.error(`[build-html] 源文件不存在: ${srcFile}`);
	process.exit(1);
}

let html = fs.readFileSync(srcFile, 'utf-8');

html = html.replace(/<!--#include file="([^"]+)"-->/g, (_, filePath) => {
	const fullPath = path.resolve(projectDir, filePath);
	if (!fs.existsSync(fullPath)) {
		console.error(`[build-html] 文件不存在: ${fullPath}`);
		return `<!-- MISSING: ${filePath} -->`;
	}
	let partial = fs.readFileSync(fullPath, 'utf-8');

	// 如果是 head.html，替换 Script/ 脚本为模块入口，保留 vs/ 和 monaco 脚本
	if (filePath === 'html/head.html') {
		partial = transformHead(partial);
	}
	// 去除 UTF-8 BOM
	if (partial.charCodeAt(0) === 0xfeff) partial = partial.slice(1);
	return partial;
});

const header =
	'<!-- 此文件由 build-html.js 自动生成。请编辑 index.src.html 和 html/ 下的 partial 文件，不要直接编辑本文件。 -->\n';
fs.writeFileSync(outFile, header + html, 'utf-8');
console.log(`[build-html] ✓ index.html 已生成 (${html.length} bytes)`);

function transformHead(headHtml) {
	const lines = headHtml.split('\n');
	const out = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed.startsWith('<script')) {
			out.push(line);
			continue;
		}
		if (trimmed.includes('src="vs/') || trimmed.includes("src='vs/")) {
			out.push(line);
			continue;
		}
		if (
			!trimmed.includes('src="Script/') &&
			!trimmed.includes("src='Script/")
		) {
			out.push(line);
			continue;
		}
	}

	// import map：渲染进程 ESM (<script type="module">) 走 Chromium fetch loader，不认 node: 协议
	// （node:electron / node:fs 等会报 ERR_UNKNOWN_URL_SCHEME）。Node 模块在渲染进程仅能通过
	// CommonJS require 取到——nodeIntegration:true 下 window.require 可用，head.html 已有
	// window.__nodeRequire=window.require 桥。故把每个裸说明符映射到 data:text/javascript 桥模块，
	// 桥内用 __nodeRequire 调 Node require 再 export。
	// 注意：data URL 必须用 base64 编码模块体以避免引号 / 换行转义问题。
	// electron / node:url 用 named import（{ clipboard, ipcRenderer, shell, webFrame }、
	// { fileURLToPath, URL }），桥必须导出同名 named export；其余用 default export。
	const nodeBridges = {
		electron: `const e=window.__nodeRequire('electron');export default e;export const{clipboard,ipcRenderer,shell,webFrame}=e`,
		'node:electron': `const e=window.__nodeRequire('electron');export default e;export const{clipboard,ipcRenderer,shell,webFrame}=e`,
		'node:url': `const u=window.__nodeRequire('url');export default u;export const{fileURLToPath,URL}=u`,
		'monaco-editor': `export default window.__nodeRequire('monaco-editor')`,
		axios: `export default window.__nodeRequire('axios').default`,
		'fs-extra': `export default window.__nodeRequire('fs-extra')`,
		yauzl: `export default window.__nodeRequire('yauzl')`,
		'markdown-it': `export default window.__nodeRequire('markdown-it')`,
		'uglify-js': `export default window.__nodeRequire('uglify-js')`,
		// 裸 'fs' / 'path' / 'os' / 'child_process'（main/main.js、其他文件仍用）
		fs: `export default window.__nodeRequire('fs')`,
		path: `export default window.__nodeRequire('path')`,
		os: `export default window.__nodeRequire('os')`,
		url: `const u=window.__nodeRequire('url');export default u;export const{fileURLToPath,URL}=u`,
		child_process: `export default window.__nodeRequire('child_process')`,
		// 'node:' 前缀说明符（global.js / file-system-core.js 等用）——同桥接
		'node:fs': `export default window.__nodeRequire('fs')`,
		'node:path': `export default window.__nodeRequire('path')`,
		'node:os': `export default window.__nodeRequire('os')`,
		'node:child_process': `export default window.__nodeRequire('child_process')`
	};
	const imports = {};
	for (const [specifier, code] of Object.entries(nodeBridges)) {
		const b64 = Buffer.from(code, 'utf-8').toString('base64');
		imports[specifier] = `data:text/javascript;base64,${b64}`;
	}
	const importMap = { imports };
	out.push(
		`  <script type="importmap">${JSON.stringify(importMap)}</script>`
	);
	out.push(
		'  <script type="module" src="Script/main/module-init.js"></script>'
	);

	return out.join('\n');
}

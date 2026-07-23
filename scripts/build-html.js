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
	let skipUntilClose = false;
	let scriptIsScript = false; // 多行 <script> 标签是否属于 src="Script/" 类

	for (const line of lines) {
		const trimmed = line.trim();

		// 多行 <script ...> 标签跳过模式：一旦进入，持续跳过直到遇到 </script>
		if (skipUntilClose) {
			if (trimmed.includes('</script>')) {
				skipUntilClose = false;
				scriptIsScript = false;
				continue;
			}
			// 蜉开所有内部行（含 src="Script/..."、defer 等）
			continue;
		}

		// 内联 <script>...</script> 单行、含 src="Script/" 的单行标签全部保留
		// 只跳过含 src="Script/" 或 src='Script/' 的单行 <script ...></script>
		if (
			trimmed.startsWith('<script') &&
			(trimmed.includes('src="Script/') || trimmed.includes("src='Script/")) &&
			!trimmed.includes('src="vs/') &&
			!trimmed.includes("src='vs/") &&
			trimmed.includes('</script>')
		) {
			continue;
		}

		// 多行 <script> 开始行（首行只有 <script 或含部分属性但无 </script>）
		if (trimmed.startsWith('<script') && !trimmed.includes('</script>')) {
			// 判是否属于 src="Script/" 类（首行或后续行含 src="Script/"）
			const isScript = trimmed.includes('src="Script/') || trimmed.includes("src='Script/");
			// 预扫后续行：直到 </script> 之前，任意行含 src="Script/" 即跳过
			if (isScript) {
				skipUntilClose = true;
				scriptIsScript = true;
				continue;
			}
			// 首行无 src="Script/"，预扫后续行确认
			// （这里不预扫，直接保守保留——后续行如 src="Script/ 会被下方分支处理）
		}

		// 单行 src="Script/..."（但不是 <script 开始行，如多行格式中间的 src= 属性行）
		// 蜉开（保留其他属性行、内联脚本等）
		if (
			(trimmed.includes('src="Script/') || trimmed.includes("src='Script/")) &&
			!trimmed.startsWith('<script')
		) {
			// 若处于多行 <script> 标签内部（且该标签是 src="Script/" 类），上方 skipUntilClose 已处理
			// 否则属多行 <script>（含 src= 属性）的外部行 — 需要确认
			// 保守策略：跳过任何 src="Script/ 的属性行（它的父 <script> 蜝被上方分支预判）
			continue;
		}

		out.push(line);
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
	out.push(`  <script type="importmap">${JSON.stringify(importMap)}</script>`);
	out.push('  <script type="module" src="Script/main/module-init.js"></script>');

	return out.join('\n');
}

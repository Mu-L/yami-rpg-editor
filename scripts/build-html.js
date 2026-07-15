const fs = require('fs')
const path = require('path')

const projectDir = path.resolve(__dirname, '..', 'Project')

const srcFile = path.join(projectDir, 'index.src.html')
const outFile = path.join(projectDir, 'index.html')

if (!fs.existsSync(srcFile)) {
	console.error(`[build-html] 源文件不存在: ${srcFile}`)
	process.exit(1)
}

let html = fs.readFileSync(srcFile, 'utf-8')

html = html.replace(/<!--#include file="([^"]+)"-->/g, (_, filePath) => {
	const fullPath = path.resolve(projectDir, filePath)
	if (!fs.existsSync(fullPath)) {
		console.error(`[build-html] 文件不存在: ${fullPath}`)
		return `<!-- MISSING: ${filePath} -->`
	}
	let partial = fs.readFileSync(fullPath, 'utf-8')

	// 如果是 head.html，替换 Script/ 脚本为模块入口，保留 vs/ 和 monaco 脚本
	if (filePath === 'html/head.html') {
		partial = transformHead(partial)
	}
	// 去除 UTF-8 BOM
	if (partial.charCodeAt(0) === 0xfeff) partial = partial.slice(1)
	return partial
})

const header =
	'<!-- 此文件由 build-html.js 自动生成。请编辑 index.src.html 和 html/ 下的 partial 文件，不要直接编辑本文件。 -->\n'
fs.writeFileSync(outFile, header + html, 'utf-8')
console.log(`[build-html] ✓ index.html 已生成 (${html.length} bytes)`)

function transformHead(headHtml) {
	const lines = headHtml.split('\n')
	const out = []

	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed.startsWith('<script')) {
			out.push(line)
			continue
		}
		if (trimmed.includes('src="vs/') || trimmed.includes("src='vs/")) {
			out.push(line)
			continue
		}
		if (
			!trimmed.includes('src="Script/') &&
			!trimmed.includes("src='Script/")
		) {
			out.push(line)
			continue
		}
	}

	out.push(
		'  <script type="module" src="Script/main/module-init.js"></script>'
	)

	return out.join('\n')
}

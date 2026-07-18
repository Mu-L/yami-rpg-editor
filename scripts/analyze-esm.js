const fs = require('fs')
const path = require('path')

const projectDir = path.resolve(__dirname, '..', 'Project')
const scriptDir = path.join(projectDir, 'Script')

const target = process.argv[2]
if (!target) {
	console.error(
		'用法: node scripts/analyze-esm.js <相对Script的路径, 如 util/safe.js>'
	)
	process.exit(1)
}

const targetPath = path.resolve(scriptDir, target)
if (!fs.existsSync(targetPath)) {
	console.error(`[analyze-esm] 文件不存在: ${targetPath}`)
	process.exit(1)
}

const content = fs.readFileSync(targetPath, 'utf-8')
const symRe = /export (?:const|function|class|let|var) (\w+)/g
const syms = []
let m
while ((m = symRe.exec(content)) !== null) syms.push(m[1])

if (syms.length === 0) {
	console.log(
		`[analyze-esm] ${target} 无顶层 export 符号，可能是纯副作用模块`
	)
	process.exit(0)
}

const allFiles = []
;(function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) walk(full)
		else if (entry.name.endsWith('.js')) allFiles.push(full)
	}
})(scriptDir)

const rel = (p) => path.relative(scriptDir, p).replace(/\\/g, '/')

for (const sym of syms) {
	const users = []
	for (const f of allFiles) {
		if (f === targetPath) continue
		const c = fs.readFileSync(f, 'utf-8')
		if (new RegExp(`\\b${sym}\\b`).test(c)) users.push(rel(f))
	}
	console.log(`\n符号 ${sym} : ${users.length} 个文件裸用`)
	for (const u of users) console.log(`  - ${u}`)
}

console.log(
	`\n[analyze-esm] 提示: 给以上每个文件加 import { ${syms.join(
		', '
	)} } from '相对路径'，并把本文件与目标文件加入 build-module.js 的 realEsmExclude`
)

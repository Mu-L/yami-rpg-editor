const fs = require('fs')
const path = require('path')

const projectDir = path.resolve(__dirname, '..', 'Project')
const scriptDir = path.join(projectDir, 'Script')

// 收集所有 JS 文件与其导出的顶层符号
function collectExports(file) {
	const code = fs.readFileSync(file, 'utf-8')
	const names = new Set()
	const re = /export\s+(?:const|let|var|function|class)\s+(\w+)/g
	let m
	while ((m = re.exec(code)) !== null) names.add(m[1])
	// export { a, b }
	const re2 = /export\s*\{([^}]+)\}/g
	while ((m = re2.exec(code)) !== null) {
		m[1].split(',').forEach((s) => {
			const n = s
				.trim()
				.split(/\s+as\s+/)
				.pop()
				.trim()
			if (n) names.add(n)
		})
	}
	return names
}

const exportMap = {}
;(function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) walk(full)
		else if (entry.name.endsWith('.js')) {
			exportMap[path.relative(scriptDir, full).replace(/\\/g, '/')] =
				collectExports(full)
		}
	}
})(scriptDir)

let errors = 0
function err(msg) {
	errors++
	console.error('  ✗ ' + msg)
}

// 校验每个文件的 import 语句
;(function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) walk(full)
		else if (entry.name.endsWith('.js')) {
			const rel = path.relative(scriptDir, full).replace(/\\/g, '/')
			const code = fs.readFileSync(full, 'utf-8')
			const re =
				/import\s*(?:\*\s*as\s*\w+|\{([^}]+)\}|\w+)?\s*from\s*['"]([^'"]+)['"]/g
			let m
			while ((m = re.exec(code)) !== null) {
				const named = m[1]
				const spec = m[2]
				if (!spec.startsWith('.')) continue
				const target = path
					.normalize(path.resolve(path.dirname(full), spec))
					.replace(/\\/g, '/')
				const targetRel = path
					.relative(scriptDir, target)
					.replace(/\\/g, '/')
				if (!fs.existsSync(target)) {
					err(`${rel}: 导入路径不存在 ${spec}`)
					continue
				}
				if (named) {
					const exp = exportMap[targetRel] || new Set()
					for (const raw of named.split(',')) {
						const name = raw
							.trim()
							.split(/\s+as\s+/)[0]
							.trim()
						if (name && !exp.has(name)) {
							err(`${rel}: ${targetRel} 未导出 ${name}`)
						}
					}
				}
			}
		}
	}
})(scriptDir)

if (errors === 0) {
	console.log('[import-graph] 全部 import 闭合 ✅')
	process.exit(0)
} else {
	console.log(`[import-graph] 失败 ${errors} 项 ❌`)
	process.exit(1)
}

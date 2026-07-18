const { execSync } = require('child_process')
const fs = require('fs')
const out = execSync('git status --short', { encoding: 'utf8' })
const files = out
	.split('\n')
	.filter((l) => l.startsWith(' M Project/Script/'))
	.map((l) =>
		l.substring(3).replace('Project/Script/', 'Script/').replace(/\\/g, '/')
	)
const set = new Set(files)
const bm = 'scripts/build-module.js'
let c = fs.readFileSync(bm, 'utf8')
const m = c.match(/const realEsmExclude = new Set\(\[([\s\S]*?)\]\)/)
if (m) {
	const existing = (m[1].match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1))
	existing.forEach((e) => set.add(e))
}
const sorted = [...set].sort()
const block = sorted.map((f) => "\t'" + f + "',").join('\n')
const newC = c.replace(
	/const realEsmExclude = new Set\(\[[\s\S]*?\]\)/,
	'const realEsmExclude = new Set([\n' + block + '\n])'
)
fs.writeFileSync(bm, newC)
console.log('realEsmExclude entries:', sorted.length)

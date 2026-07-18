const { execSync } = require('child_process')
const fs = require('fs')
const out = execSync('git status --short', { encoding: 'utf8' })
const files = out
	.split('\n')
	.filter((l) => l.startsWith(' M Project/Script/'))
	.map((l) => l.substring(3))
let fail = 0
for (const f of files) {
	try {
		execSync(`node --check "${f}"`, { stdio: 'pipe' })
	} catch (e) {
		fail++
		console.log('FAIL: ' + f)
		if (fail <= 10) console.log(e.stderr.toString().split('\n')[0])
	}
}
console.log('total modified:', files.length, 'syntax failures:', fail)

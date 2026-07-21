const { execSync } = require('child_process');
const fs = require('fs');
const out = execSync('git status --short', { encoding: 'utf8' });
const files = out
	.split('\n')
	.filter((l) => l.startsWith(' M Project/Script/'))
	.map((l) => l.substring(3));
let fail = 0;
for (const f of files) {
	// .ts 文件 node --check 不支持，改用 tsc 单文件类型检查
	const isTs = f.endsWith('.ts');
	const cmd = isTs
		? `node_modules/.bin/tsc --noEmit --skipLibCheck --target es2022 --module esnext --moduleResolution bundler "${f}"`
		: `node --check "${f}"`;
	try {
		execSync(cmd, { stdio: 'pipe' });
	} catch (e) {
		fail++;
		console.log('FAIL: ' + f);
		if (fail <= 10) console.log(e.stderr.toString().split('\n')[0]);
	}
}
console.log('total modified:', files.length, 'syntax failures:', fail);

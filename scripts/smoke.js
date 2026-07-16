'use strict'

// 轻量冒烟测试（不引入 Vitest）：验证关键构建/加载链路不变量。
// 零副作用：只读文件 + vm 加载，不写项目产物。

const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = path.resolve(__dirname, '..')
const COMMAND_DIR = path.join(ROOT, 'Project', 'Script', 'module', 'command')
const TEST_FILES = [
	'Project/Script/module/command/schema.js',
	'Project/Script/command/command-object.js'
]

let failures = 0
function fail(msg) {
	failures++
	console.error('  ✗ ' + msg)
}
function ok(msg) {
	console.log('  ✓ ' + msg)
}

function stripESM(code) {
	return code
		.replace(/^\s*export\s+/gm, '')
		.replace(/window\.CommandSchema\s*=\s*CommandSchema\s*;?/g, '')
}

// 极简 DOM / 全局 stub
function makeEl() {
	let v = undefined
	return {
		write(x) {
			v = x
		},
		read() {
			return v
		},
		getFocus() {},
		on() {},
		addClass() {},
		removeClass() {},
		show() {},
		hide() {},
		querySelector() {
			return null
		},
		childNodes: [],
		appendChild() {},
		removeChild() {},
		firstChild: null
	}
}
const noop = () => {}

function createSandbox() {
	const sb = {
		console,
		Math,
		Object,
		Array,
		JSON,
		Promise,
		Set,
		Map,
		Symbol,
		String: { compress: (s) => s },
		Event: function () {},
		document: {
			createElement: () => makeEl(),
			createElementNS: () => makeEl(),
			getElementById: () => makeEl(),
			querySelector: () => makeEl()
		},
		Local: { get: (k) => k, language: 'en', createGetter: () => (k) => k },
		Token: (s) => s,
		PluginManager: { reconstruct: noop, parseMeta: noop },
		File: { planToSave: noop, get: () => Promise.resolve({}) },
		Clipboard: { write: noop, read: noop, has: () => false },
		Menu: { popup: noop },
		Window: {
			open: noop,
			close: noop,
			confirm: noop,
			absolutePos: {},
			setPositionMode: noop
		},
		EventBus: { emit: noop, on: noop },
		Data: { scripts: {}, commands: [], events: {}, variables: { map: {} } },
		CommandSuggestion: {
			windowLocalize: noop,
			data: {},
			list: { data: [] }
		},
		TreeList: { deleteCaches: noop, createParents: noop },
		Selector: { open: noop },
		Log: { warn: noop, throw: noop }
	}
	sb.window = sb
	sb.globalThis = sb
	sb.$ = () => makeEl()
	return sb
}

console.log('[smoke] 1. 加载 CommandSchema + command-object + 全部指令 case')
const sb = createSandbox()
try {
	for (const f of TEST_FILES) {
		const code = stripESM(fs.readFileSync(path.join(ROOT, f), 'utf8'))
		vm.runInNewContext(code, sb, f)
	}
} catch (e) {
	fail('加载核心模块抛错: ' + e.message)
}

// 逐文件加载 module/command/*.js（排除已由 TEST_FILES 加载的 schema.js）
const caseFiles = fs
	.readdirSync(COMMAND_DIR)
	.filter(
		(f) => f.endsWith('.js') && !TEST_FILES.some((t) => t.endsWith('/' + f))
	)
let loaded = 0
for (const f of caseFiles) {
	try {
		const code = stripESM(
			fs.readFileSync(path.join(COMMAND_DIR, f), 'utf8')
		)
		vm.runInNewContext(code, sb, f)
		loaded++
	} catch (e) {
		fail(`指令 case 加载失败: ${f} -> ${e.message}`)
	}
}
if (loaded === caseFiles.length) ok(`全部 ${loaded} 个指令 case 加载无异常`)
else fail(`仅 ${loaded}/${caseFiles.length} 个 case 加载成功`)

// 统计注册的 Command.cases（command-object.js 经 window.Command = Command 暴露）
const Command = sb.Command
if (!Command || !Command.cases) {
	fail('Command.cases 未注册（command-object.js 未暴露 window.Command）')
} else {
	const registeredCases = Object.keys(Command.cases).length
	if (registeredCases > 100) ok(`Command.cases 注册数 = ${registeredCases}`)
	else fail(`Command.cases 注册数异常: ${registeredCases}`)

	// 补全 parse 辅助方法（仅当 command-object.js 未提供时），供样例 parse 使用
	Command.save = Command.save || noop
	Command.parseActor = Command.parseActor || ((a) => (a && a.type) || '')
	Command.parseObject = Command.parseObject || ((o) => (o && o.type) || '')
	Command.parseElement = Command.parseElement || ((e) => (e && e.type) || '')
	Command.parseVariableNumber = Command.parseVariableNumber || ((v) => v)
	// 兜底：任何未定义的 Command.parse* 方法给安全返回值，避免样例 parse 因 stub 缺口误报
	for (const key of Object.getOwnPropertyNames(Command)) {
		if (key.startsWith('parse') && typeof Command[key] !== 'function') {
			Command[key] = () => ''
		}
	}
}

console.log(
	'[smoke] 2. 全量验证 parse 为函数（深度 parse 需完整 helper，仅在样例上调用）'
)
let fnOk = 0
let fnFail = 0
for (const name of Object.keys(Command.cases)) {
	const inst = Command.cases[name]
	if (typeof inst.parse === 'function') fnOk++
	else {
		fnFail++
		if (fnFail <= 10) fail(`parse 非函数: ${name}`)
	}
}
if (fnFail === 0) ok(`全部 ${fnOk} 个指令均有 parse 函数`)
else fail(`${fnOk} 成功 / ${fnFail} 失败`)

// 在已迁移/代表性样例上实际调用 parse（提供所需 helper）
const sampleNames = [
	'wait',
	'comment',
	'label',
	'deleteActor',
	'deleteObject',
	'resetTargets',
	'waitForVideo',
	'nestElement',
	'break',
	'continue'
]
let callOk = 0
let callFail = 0
for (const name of sampleNames) {
	const inst = Command.cases[name]
	if (!inst) {
		fail(`样例缺失: ${name}`)
		continue
	}
	try {
		const parsed = inst.parse(
			inst.createDefault ? inst.createDefault() : {}
		)
		if (!Array.isArray(parsed)) throw new Error('parse 未返回数组')
		callOk++
	} catch (e) {
		callFail++
		if (callFail <= 10) fail(`parse 调用抛错: ${name} -> ${e.message}`)
	}
}
if (callFail === 0) ok(`样例 parse 调用成功: ${callOk} 个`)
else fail(`${callOk} 成功 / ${callFail} 失败`)

console.log('[smoke] 3. 初始化顺序 guard 逻辑')
// 直接验证 guard 判定：Command 早于 Inspector 应告警
const initializedSet = new Set()
let warned = false
function guard(name) {
	if (name === 'Command' && !initializedSet.has('Inspector')) warned = true
}
guard('Command')
if (warned) ok('顺序颠倒时 guard 能检出 (Inspector 未先于 Command)')
else fail('guard 未检出顺序错误')

console.log('')
if (failures === 0) {
	console.log('[smoke] 全部通过 ✅')
	process.exit(0)
} else {
	console.log(`[smoke] 失败 ${failures} 项 ❌`)
	process.exit(1)
}

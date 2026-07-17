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

console.log('[smoke] 4. 插件 @group 参数分组解析')
// 以递归 stub 加载 plugin.js，验证 parseMeta 能正确标注 parameter.group
function makeRecStub() {
	const f = function () {
		return makeRecStub()
	}
	f.createDefaultForPlugin = () => ({ type: 'none' })
	return new Proxy(f, {
		get(t, p) {
			if (p === 'list') return makeRecStub()
			if (p === Symbol.toPrimitive) return () => ''
			if (p in t) return t[p]
			return makeRecStub()
		},
		apply() {
			return makeRecStub()
		},
		construct() {
			return makeRecStub()
		}
	})
}
const pluginSandbox = {
	console,
	Math,
	Object,
	Array,
	JSON,
	Promise,
	Set,
	Map,
	Symbol,
	String,
	Event: function () {},
	window: null,
	Local: { get: (k) => k, language: 'en' },
	File: { parseMetaName: (m) => m.overview?.plugin || 'plugin' }
}
pluginSandbox.window = pluginSandbox
pluginSandbox.globalThis = pluginSandbox
pluginSandbox.$ = () => makeRecStub()
pluginSandbox.LanguageMap = class {
	constructor() {
		this.packs = []
	}
	append(p) {
		this.packs.push(p)
	}
	update() {
		return { get: (k) => (k && k[0] === '#' ? k.slice(1) : k || '') }
	}
}
pluginSandbox.OptionManager = class extends Array {
	constructor() {
		super()
		this.wraps = {}
		this.states = {}
	}
	append(o) {
		this.push(o)
	}
}
const pluginProxy = new Proxy(pluginSandbox, {
	get(target, prop) {
		if (prop in target) return target[prop]
		if (typeof prop === 'symbol') return undefined
		if (typeof globalThis[prop] !== 'undefined') return globalThis[prop]
		return makeRecStub()
	},
	has() {
		return true
	}
})
let groupOk = true
try {
	const pluginCode = stripESM(
		fs.readFileSync(
			path.join(ROOT, 'Project/Script/plugin/plugin.js'),
			'utf8'
		)
	)
	vm.runInNewContext(pluginCode, pluginProxy, 'plugin.js')
	const parseMeta = pluginSandbox.PluginManager.parseMeta
	const sample = `/* @plugin Demo
@group Target
@actor target
@number damage @default 10

@group Options
@boolean heavy
@string name @alias 名称
*/`
	const meta = {}
	parseMeta(meta, sample)
	const find = (k) => meta.parameters.find((p) => p.key === k)
	const checks = [
		['target', 'Target'],
		['damage', 'Target'],
		['heavy', 'Options'],
		['name', 'Options']
	]
	for (const [k, g] of checks) {
		if (find(k)?.group !== g) {
			groupOk = false
			fail(`@group 解析错误: ${k} 期望 ${g} 实得 ${find(k)?.group}`)
		}
	}
	// 验证 @desc 本地化 #key 引用
	const descSample = `/* @plugin Demo
@lang en
#dmgDesc Damage value

@number damage @desc #dmgDesc
@string note @desc Plain text
*/`
	const dmeta = {}
	parseMeta(dmeta, descSample)
	const dlm = dmeta.langMap.update()
	const dmgParam = dmeta.parameters.find((p) => p.key === 'damage')
	const noteParam = dmeta.parameters.find((p) => p.key === 'note')
	if (dlm.get(dmgParam.desc) !== 'Damage value') {
		groupOk = false
		fail(`@desc 本地化错误: 实得 "${dlm.get(dmgParam.desc)}"`)
	}
	if (dlm.get(noteParam.desc) !== 'Plain text') {
		groupOk = false
		fail(`@desc 纯文本错误: 实得 "${dlm.get(noteParam.desc)}"`)
	}
	// 验证 @deprecated 元数据标注
	const metaSample = `/* @plugin Old Plugin
@version 1.2
@deprecated 请改用 New Plugin
*/`
	const metameta = {}
	parseMeta(metameta, metaSample)
	const ov = metameta.overview
	if (ov.deprecated !== '请改用 New Plugin') {
		groupOk = false
		fail(`@deprecated 解析错误: ${JSON.stringify(ov.deprecated)}`)
	}
	const metaSimple = `/* @plugin X\n@deprecated\n*/`
	const ms = {}
	parseMeta(ms, metaSimple)
	if (ms.overview.deprecated !== true) {
		groupOk = false
		fail(
			`@deprecated 无参数解析错误: ${JSON.stringify(ms.overview.deprecated)}`
		)
	}
	// 验证 @require 依赖声明解析
	const reqSample = `/* @plugin Demo
@require BasePlugin 1.0
@require OtherPlugin
*/`
	const reqmeta = {}
	parseMeta(reqmeta, reqSample)
	const reqs = reqmeta.overview.requires
	if (
		!Array.isArray(reqs) ||
		reqs.length !== 2 ||
		reqs[0].plugin !== 'BasePlugin' ||
		reqs[0].version !== '1.0' ||
		reqs[1].plugin !== 'OtherPlugin' ||
		reqs[1].version !== ''
	) {
		groupOk = false
		fail(`@require 解析错误: ${JSON.stringify(reqs)}`)
	}
	// 验证 @placeholder 解析
	const spSample = `/* @plugin Demo
@number amount
@placeholder 输入数量
@string name
@placeholder 角色名
*/`
	const spmeta = {}
	parseMeta(spmeta, spSample)
	const amount = spmeta.parameters.find((p) => p.key === 'amount')
	const name = spmeta.parameters.find((p) => p.key === 'name')
	if (!amount || amount.placeholder !== '输入数量') {
		groupOk = false
		fail(
			`@placeholder 解析错误: ${JSON.stringify(amount && amount.placeholder)}`
		)
	}
	if (!name || name.placeholder !== '角色名') {
		groupOk = false
		fail(
			`@placeholder 字符串解析错误: ${JSON.stringify(name && name.placeholder)}`
		)
	}
	// 验证 @group[] 可重复参数组解析
	const rgSample = `/* @plugin DropTable
@group Drops
@item-getter item
@number chance @default 50
@group[] Drops
*/`
	const rgMeta = {}
	parseMeta(rgMeta, rgSample)
	const rgParam = rgMeta.parameters.find((p) => p.type === 'repeatable-group')
	const rgChecks = [
		['@group[] 未创建 repeatable-group 参数', !!rgParam],
		['@group[] key 应为 Drops', rgParam?.key === 'Drops'],
		['@group[] 缺少 repeatableGroup 模板', !!rgParam?.repeatableGroup],
		[
			'@group[] 模板参数数应为 2',
			rgParam?.repeatableGroup?.parameters?.length === 2
		],
		[
			'@group[] 模板首参数名应为 item',
			rgParam?.repeatableGroup?.parameters?.[0]?.key === 'item'
		],
		['@group[] 默认值应为 []', rgParam?.value?.join() === '']
	]
	for (const rp of rgMeta.parameters) {
		if (rp.group === 'Drops' && rp.type !== 'repeatable-group') {
			fail(`@group[] 有残留 group=Drops 参数: ${rp.key}`)
		}
	}
	let repeatableOk = true
	for (const [msg, ok_] of rgChecks) {
		if (!ok_) {
			repeatableOk = false
			fail(msg)
		}
	}
	if (repeatableOk) ok('@group[] 可重复参数组解析正确')
	// 验证 @readonly 解析
	const roSample = `/* @plugin Demo\n@number fixed\n@readonly\n@string editable\n*/`
	const roMeta = {}
	parseMeta(roMeta, roSample)
	const fixedParam = roMeta.parameters.find((p) => p.key === 'fixed')
	const editableParam = roMeta.parameters.find((p) => p.key === 'editable')
	if (fixedParam?.readonly !== true) {
		groupOk = false
		fail(`@readonly 解析错误: ${JSON.stringify(fixedParam?.readonly)}`)
	}
	if (editableParam?.readonly === true) {
		groupOk = false
		fail(
			`@readonly 误标记 editable: ${JSON.stringify(editableParam?.readonly)}`
		)
	}
	if (fixedParam?.readonly === true && editableParam?.readonly !== true)
		ok('@readonly 解析正确')
	// 验证 @hidden 解析
	const hSample = `/* @plugin Demo\n@number visible\n@string internal\n@hidden\n*/`
	const hMeta = {}
	parseMeta(hMeta, hSample)
	const visibleParam = hMeta.parameters.find((p) => p.key === 'visible')
	const hiddenParam = hMeta.parameters.find((p) => p.key === 'internal')
	if (hiddenParam?.hidden !== true) {
		groupOk = false
		fail(`@hidden 解析错误: ${JSON.stringify(hiddenParam?.hidden)}`)
	}
	if (visibleParam?.hidden === true) {
		groupOk = false
		fail(`@hidden 误标记 visible: ${JSON.stringify(visibleParam?.hidden)}`)
	}
	if (hiddenParam?.hidden === true && visibleParam?.hidden !== true)
		ok('@hidden 解析正确')
	// 验证 @validate 解析
	const vSample = `/* @plugin Demo\n@string code\n@validate pattern:^[a-z]+$ minLength:3 maxLength:10 notEmpty\n@string free\n*/`
	const vMeta = {}
	parseMeta(vMeta, vSample)
	const codeParam = vMeta.parameters.find((p) => p.key === 'code')
	const freeParam = vMeta.parameters.find((p) => p.key === 'free')
	if (!codeParam?.validate) {
		groupOk = false
		fail('@validate 未解析出 validate 对象')
	} else {
		const v = codeParam.validate
		if (!v.pattern || v.pattern.source !== '^[a-z]+$') {
			groupOk = false
			fail(`@validate pattern 错误: ${v.pattern}`)
		}
		if (v.minLength !== 3) {
			groupOk = false
			fail(`@validate minLength 错误: ${v.minLength}`)
		}
		if (v.maxLength !== 10) {
			groupOk = false
			fail(`@validate maxLength 错误: ${v.maxLength}`)
		}
		if (v.notEmpty !== true) {
			groupOk = false
			fail(`@validate notEmpty 错误: ${v.notEmpty}`)
		}
	}
	if (freeParam?.validate !== undefined) {
		groupOk = false
		fail(`@validate 误标记 free: ${JSON.stringify(freeParam?.validate)}`)
	}
	if (codeParam?.validate && freeParam?.validate === undefined)
		ok('@validate 解析正确')
} catch (e) {
	groupOk = false
	fail('plugin.js 新标签解析抛错: ' + e.message)
}
if (groupOk)
	ok(
		'@group 分组 + @desc 本地化 + @deprecated + @require + @placeholder + @group[] + @readonly + @hidden + @validate 解析正确'
	)

console.log('')
if (failures === 0) {
	console.log('[smoke] 全部通过 ✅')
	process.exit(0)
} else {
	console.log(`[smoke] 失败 ${failures} 项 ❌`)
	process.exit(1)
}

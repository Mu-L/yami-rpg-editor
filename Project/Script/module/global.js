import { $ } from '../util/dom.js'
import { Attribute } from '../attribute/attribute-window.js'
import { Codec } from '../codec/codec.js'
import { CommandList } from '../components/command-list.js'
import { Menu } from '../components/menu-list.js'
import { Data } from '../data/data-object.js'
import { Project } from '../data/project-settings-window.js'
import { Enum } from '../enum/enum-window.js'
import { Localization } from '../local/local-window.js'
import { UpdateLog } from '../log/update-log-window.js'
import { Editor } from '../main/editor.js'
import { EditDataInstance } from './editdata.js'
import { EventBus } from './eventbus.js'
import { Resources } from './resource.js'
import { AutoTile } from '../palette/auto-tile.js'
import { Scene } from '../scene/scene-window.js'
import { NewProject } from '../title/new-project-window.js'
import { Title } from '../title/title-bar.js'
import { Local } from '../tools/localization.js'
import { Window } from '../tools/window-object.js'
import { UI } from '../ui/ui-window.js'
import { Updater } from '../update/updater.js'
import { Variable } from '../variable/variable.js'
const require = window.__nodeRequire || window.require
const Path = require('path')
const GlobalPath = Path.resolve(require('os').homedir(), '.openyami')
// ESM 下 __dirname 不存在，用 import.meta.url 推算：file: 协议剥两次得 dist/，http/https 兜底 process.cwd()/Project
const { fileURLToPath, URL } = require('url')
const _moduleURL = new URL(import.meta.url)
const _modulePath =
	_moduleURL.protocol === 'file:'
		? fileURLToPath(_moduleURL)
		: Path.resolve(
				process.cwd(),
				'Project',
				_moduleURL.pathname.split('/').pop()
			)
const __dirname =
	_moduleURL.protocol === 'file:'
		? Path.dirname(Path.dirname(_modulePath)) // dist/assets/x.js → dist/
		: Path.resolve(process.cwd(), 'Project')
// oxlint-disable no-unused-vars
/* 小改动或者不确定放哪的都可以放这 */
export const fs = require('fs-extra')
export const yauzl = require('yauzl')

export const CommunityVersion = '26071701' // 社区编辑器版本

EventBus.once('editor_loaded', () => {
	// 更新项目数据
	const checkForProjectUpdatesOrigin = Editor.checkForProjectUpdates
	Editor.checkForProjectUpdates = function (verNum) {
		checkForProjectUpdatesOrigin.call(this, verNum)
		// 增加缺失的属性
		if (!Data.config.deadzone) {
			Data.config.deadzone = 0.4
			Project.changed = true
		}
	}
})

export let PackMeta = JSON.parse(
	require('fs').readFileSync(
		Path.join(__dirname, 'Script/module', 'packmeta.json')
	)
) // 资源 meta 信息

export const TemplatesPath = Path.resolve(GlobalPath, 'Templates') // 模板路径
if (!fs.existsSync(TemplatesPath))
	fs.mkdirSync(TemplatesPath, { recursive: true })

// 检测是否安装了资源包
export function isNoResource() {
	const bak = JSON.parse(JSON.stringify(PackMeta))
	delete bak['Editor']
	delete bak['Project']
	delete bak['Community']
	const p = { ...bak }
	Object.defineProperty(p, '@', {
		value: false,
		enumerable: false,
		writable: true
	})
	try {
		const checkArr = []
		// 分别检测包是否存在
		Object.keys(p).map((v) => {
			p[v] = {}
			p[v]['check'] = false
			const _path = Path.resolve(TemplatesPath, v)
			if (fs.existsSync(_path)) {
				p[v]['check'] = true
				checkArr.push(true)
			} else {
				checkArr.push(false)
			}
		})
		if (checkArr.every((v) => v)) p['@'] = true
		return p
	} catch {
		return p
	}
}

export let NoResourceObj = isNoResource()

// ESM 下被 import 的 let 绑定对导入方是只读的（live binding 但 const 语义），
// 跨模块整体赋值会抛 Assignment to constant variable；故提供 setter，
// 在本模块内部完成赋值，让 live binding 把新值传给所有导入方
export function setPackMeta(value) {
	PackMeta = value
}
export function setNoResourceObj(value) {
	NoResourceObj = value
}

window.addEventListener('localize', () => {
	Resources.initialize() // 初始化
	if (
		!NoResourceObj['arpg-ts-english'].check &&
		!NoResourceObj['arpg-ts-chinese'].check
	) {
		Resources.open()
		Resources.checkEditorVersion() // 只检测编辑器版本
	} else {
		Resources.checkVersion()
	}
	Resources.loaded = true // 已检查过资源
})

/* 新项目确认 */
$('#newProject-confirm').off('click', NewProject.confirm)
export const TitleConfirmOld = NewProject.confirm
NewProject.confirm = function () {
	const template = $('#newProject-template').read()
	NoResourceObj = isNoResource()
	if (
		(template == 'arpg-ts-english' &&
			NoResourceObj['arpg-ts-english'].check) ||
		(template == 'arpg-ts-chinese' &&
			NoResourceObj['arpg-ts-chinese'].check) ||
		template != ['arpg-ts-english', 'arpg-ts-chinese']
	) {
		TitleConfirmOld.call(Title)
	} else {
		alert(Local.get('confirmation.resource-not-found'))
	}
}
$('#newProject-confirm').off('click', NewProject.confirm)

// 解压zip
export const unzipWithProgress = async ({ zipPath, outputDir, onProgress }) => {
	return new Promise((resolve, reject) => {
		let totalFiles = 0
		let extractedFiles = 0

		// 打开 ZIP 文件
		yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
			if (err) return reject(err)
			zipfile.on('entry', () => {
				totalFiles++
			})
			zipfile.readEntry()
			zipfile.on('entry', (entry) => {
				const destPath = Path.join(outputDir, entry.fileName)

				// 如果是目录，创建目录
				if (entry.fileName.endsWith('/')) {
					fs.ensureDirSync(destPath)
					zipfile.readEntry()
					return
				}

				// 确保目标目录存在
				fs.ensureDirSync(Path.dirname(destPath))

				// 解压文件
				zipfile.openReadStream(entry, (err, readStream) => {
					if (err) return reject(err)

					const writeStream = fs.createWriteStream(destPath)
					readStream.pipe(writeStream)

					writeStream.on('close', () => {
						extractedFiles++
						const progress = Math.round(
							(extractedFiles / totalFiles) * 100
						)
						onProgress?.(progress)

						zipfile.readEntry()
					})
				})
			})

			zipfile.on('end', () => {
				resolve('解压完成')
			})

			zipfile.on('error', (err) => {
				reject(err)
			})
		})
	})
}

EventBus.once('editor_loaded', () => {
	CommandList.prototype.openEdit = function () {
		Window.open('edit-data')
		EditDataInstance.open(this)
	}
})

export function find_dItem(fn) {
	var list = this.selections || []
	var cur = list[list.length - 1]
	var next = cur?.element?.nextSibling?.item
	var insertBefore = false

	if (!cur) {
		//什么都没选，直接插入到最底下
		return fn()
	}
	if (cur.class == 'folder') {
		//选中了文件夹
		return fn(cur)
	}
	if (!next) {
		//没有下一个元素，但是当前元素在文件夹内
		if (cur.parent.class == 'folder') {
			return fn(cur.parent)
		}
		return fn()
	}

	//是和自己同一个文件夹内
	if (next.parent == cur.parent) {
		if (next.class == 'folder') {
			insertBefore = true
		}
		return fn(next, insertBefore)
	} else {
		return fn(cur.parent)
	}
}

// 列表 - 粘贴（延迟到应用加载完成，避免循环依赖 TDZ）
EventBus.once('editor_loaded', () => {
	Scene.list.paste = function (dItem, callback) {
		const copy = Clipboard.read('yami.scene.object')
		if (copy && this.data) {
			switch (copy.class) {
				case 'tilemap':
					Codec.decodeTilemap(copy)
					copy.shortcut = 0
					break
			}

			var insertBefore = false
			if (dItem === 'auto') {
				find_dItem.call(this, (a, b) => {
					dItem = a
					insertBefore = b
				})
			}
			callback?.(copy)
			this.addNodeTo(copy, dItem, insertBefore)
			Scene.requestRendering()
		}
	}

	// 列表 - 粘贴
	Enum.list.paste = function () {
		const copy = Clipboard.read('yami.data.enumeration')
		if (copy) {
			// 只有冲突时进行更换ID
			// 支持跨项目复制保留ID
			if (Enum.idMap[copy.id]) {
				copy.id = Enum.createId()
				//如果需要去掉后面的 -copy，把下面这行注释就好了
				copy.name += ' - Copy'
			}

			find_dItem.call(this, (a, b) => {
				this.addNodeTo(copy, a, b)
			})
		}
	}

	// 列表 - 粘贴
	Variable.list.paste = function () {
		const copy = Clipboard.read('yami.data.variable')
		if (copy) {
			// 只有冲突时进行更换ID
			// 支持跨项目复制保留ID
			if (Variable.idMap[copy.id]) {
				copy.id = Variable.createId()
				//如果需要去掉后面的 -copy，把下面这行注释就好了
				copy.name += ' - Copy'
			}

			find_dItem.call(this, (a, b) => {
				this.addNodeTo(copy, a, b)
			})
		}
	}

	// 列表 - 粘贴
	Attribute.list.paste = function () {
		const copy = Clipboard.read('yami.data.attribute')
		if (copy) {
			// 只有冲突时进行更换ID
			// 支持跨项目复制保留ID
			if (Attribute.idMap[copy.id]) {
				copy.id = Attribute.createId()
				//如果需要去掉后面的 -copy，把下面这行注释就好了
				copy.name += ' - Copy'
			}

			find_dItem.call(this, (a, b) => {
				this.addNodeTo(copy, a, b)
			})
		}
	}

	// 列表 - 粘贴
	Localization.list.paste = function () {
		const copy = Clipboard.read('yami.data.localization')
		if (copy) {
			// 只有冲突时进行更换ID
			// 支持跨项目复制保留ID
			if (Localization.idMap[copy.id]) {
				copy.id = Localization.createId()
				//如果需要去掉后面的 -copy，把下面这行注释就好了
				copy.name += ' - Copy'
			}
			find_dItem.call(this, (a, b) => {
				this.addNodeTo(copy, a, b)
			})
		}
	}

	// 列表 - 粘贴
	UI.list.paste = function (_, callback) {
		const copy = Clipboard.read('yami.ui.object')
		if (copy && this.data) {
			callback?.(copy)
			this.addNodeTo(copy, UI.target)
			UI.requestRendering()
		}
	}
})

// 主界面 - 版本号
export const homeElem = $('#home-version')

homeElem.textContent = `当前社区版本：${CommunityVersion} 当前编辑器版本：${Updater.latestEditorVersion} 
当前项目版本：${Updater.latestProjectVersion}`
;(() => {
	PackMeta['Editor'] = Updater.latestEditorVersion
	PackMeta['Project'] = Updater.latestProjectVersion
	PackMeta['Community'] = CommunityVersion
	fs.writeFileSync(
		Path.join(__dirname, 'Script/module', 'packmeta.json'),
		JSON.stringify(PackMeta)
	)
})()

// 自动图块 - 显示引用数量
const originAutoTileTemplateUpdate = AutoTile.templateList.update
AutoTile.templateList.update = function () {
	originAutoTileTemplateUpdate.call(this)
	const autoList = Object.keys(Data.tilesets)
		.map((v) => Data.tilesets[v])
		.filter((v) => v.type === 'auto')
	const countMap = {}
	const data = this.data
	// 计数
	for (let i = 0; i < autoList.length; i++) {
		const tiles = autoList[i].tiles
		for (let j = 0; j < tiles.length; j++) {
			const tile = tiles[j]

			if (typeof tile !== 'object') continue // 可能不是对象
			const template = tile.template
			if (!countMap[template]) countMap[template] = 0
			countMap[template]++
			break // 只需要计数一次
		}
	}
	// 显示
	for (let i = 0; i < data.length; i++) {
		const item = data[i]
		const count = countMap[item.id] || 0
		item.element.querySelector('.autoTile-count')?.remove()
		const countElem = document.createElement('span')
		countElem.className = 'autoTile-count'
		countElem.style =
			'color: var(--team-relation-mark-color-friend);padding:4px 2px;margin-left: 4px;'
		countElem.textContent = count
		item.element.append(countElem)
	}
}

// ================================ 更新日志窗口 - 切换公告功能 ================================

UpdateLog.currentMode = 'internal' // 'internal' or 'community'
UpdateLog.internalItems = []
UpdateLog.communityItems = []

export const UpdateLogInitializeOrigin = UpdateLog.initialize
window.on('localize', () => {
	// 设置标签页按钮的本地化文本
	const tabInternal = $('#update-log-tab-internal')
	const tabCommunity = $('#update-log-tab-community')
	const tabDonation = $('#update-log-tab-donation')
	if (tabInternal)
		tabInternal.innerHTML = Local.get(
			'menuOpenYami.update-log-tab-internal'
		)
	if (tabCommunity)
		tabCommunity.textContent = Local.get(
			'menuOpenYami.update-log-tab-community'
		)
	if (tabDonation)
		tabDonation.textContent = Local.get(
			'menuOpenYami.update-log-tab-donation'
		)
})
UpdateLog.initialize = function () {
	UpdateLogInitializeOrigin.call(this)

	// 使用事件委托处理标签页按钮点击
	const tabsContainer = $('#update-log-tabs')
	if (tabsContainer) {
		tabsContainer.addEventListener('click', (event) => {
			const btn = event.target.closest('.update-log-tab')
			if (btn) {
				if (btn.id === 'update-log-tab-internal') {
					UpdateLog.switchMode('internal')
				} else if (btn.id === 'update-log-tab-community') {
					UpdateLog.switchMode('community')
				} else if (btn.id === 'update-log-tab-donation') {
					UpdateLog.switchMode('donation')
				}
			}
		})
	}
}

export const UpdateLogOpenOrigin = UpdateLog.open
UpdateLog.open = function (items = null) {
	if (items instanceof Array) {
		Window.open('update-log')
		this.internalItems = items
		this.currentMode = 'internal'
		this.update(items)
		// 异步加载社区版公告
		this.loadCommunityReleases()
	} else {
		UpdateLogOpenOrigin.call(this)
	}
}

export function markndownToHtml(markdown) {
	var md = new require('markdown-it')()
	return md.render(markdown)
}

export const UpdateLogUpdateOrigin = UpdateLog.update
UpdateLog.update = function (items) {
	if (this.currentMode === 'internal') {
		UpdateLogUpdateOrigin.call(this, items)
	} else {
		// 显示社区版公告
		this.content.clear()
		const communityItems = this.communityItems

		for (const item of communityItems) {
			if (item.title) {
				const title = document.createElement('text')
				title.innerHTML = markndownToHtml(item.title)
				title.addClass('update-log-title')
				this.content.appendChild(title)
			}
			if (item.major) {
				const major = document.createElement('text')
				major.innerHTML = markndownToHtml(item.major)
				major.addClass('update-log-major')
				this.content.appendChild(major)
			}
			if (item.minor) {
				const minor = document.createElement('text')
				minor.innerHTML = markndownToHtml(item.minor)
				minor.addClass('update-log-minor')
				this.content.appendChild(minor)
			}
		}
	}
}

UpdateLog.switchMode = function (mode) {
	if (mode === this.currentMode) return
	this.currentMode = mode

	if (mode === 'internal') {
		this.update(this.internalItems)
	} else if (mode === 'community') {
		this.update()
	} else if (mode === 'donation') {
		this.displayDonationList()
	}

	// 更新按钮状态
	const tabInternal = $('#update-log-tab-internal')
	const tabCommunity = $('#update-log-tab-community')
	const tabDonation = $('#update-log-tab-donation')

	if (mode === 'internal') {
		if (tabInternal) tabInternal.addClass('active')
		if (tabCommunity) tabCommunity.removeClass('active')
		if (tabDonation) tabDonation.removeClass('active')
	} else if (mode === 'community') {
		if (tabInternal) tabInternal.removeClass('active')
		if (tabCommunity) tabCommunity.addClass('active')
		if (tabDonation) tabDonation.removeClass('active')
	} else if (mode === 'donation') {
		if (tabInternal) tabInternal.removeClass('active')
		if (tabCommunity) tabCommunity.removeClass('active')
		if (tabDonation) tabDonation.addClass('active')
	}
}

// 加载社区版公告
UpdateLog.loadCommunityReleases = async function () {
	try {
		const response = await fetch(
			'https://api.github.com/repos/Open-Yami-Community/yami-rpg-editor/releases'
		)
		if (!response.ok) throw new Error('Failed to fetch releases')
		const releases = await response.json()
		this.communityItems = this.parseCommunityReleases(releases)
	} catch (error) {
		console.error('Failed to load community releases:', error)
		this.communityItems = [
			{
				title: 'Error',
				major: 'Failed to load community releases from GitHub'
			}
		]
	}
}

// 显示捐赠名单
UpdateLog.displayDonationList = function () {
	this.content.clear()
	const donationData = [
		{
			name: '刀里个刀(420488038)',
			amount: 200,
			link: 'tencent://message/?uin=420488038&Site=qq&Menu=yes'
		},
		{
			name: 'ya(332685057)',
			amount: 100,
			link: 'tencent://message/?uin=332685057&Site=qq&Menu=yes'
		}
	]

	const donationTitle = document.createElement('text')
	donationTitle.innerHTML = '<b>感谢以下捐赠者对项目的支持！</b>'
	donationTitle.addClass('update-log-title')
	this.content.appendChild(donationTitle)

	const donationList = document.createElement('box')
	donationList.addClass('donation-list')

	for (const donor of donationData) {
		const donorItem = document.createElement('text')
		const link = document.createElement('a')
		link.href = '#'
		link.textContent = donor.name
		link.addEventListener('click', (e) => {
			e.preventDefault()
			require('electron').shell.openExternal(donor.link)
		})
		donorItem.appendChild(link)
		donorItem.append(`: ￥${donor.amount.toFixed(2)}`)
		donorItem.addClass('donation-item')
		donationList.appendChild(donorItem)
	}

	this.content.appendChild(donationList)
}

// 解析社区版公告
UpdateLog.parseCommunityReleases = function (releases) {
	const items = []
	for (const release of releases) {
		items.push({
			title: release.name,
			major: release.body || 'No description provided'
		})
	}
	return items
}

export const UpdateLogWindowClosedOrigin = UpdateLog.windowClosed

UpdateLog.windowClosed = function () {
	UpdateLogWindowClosedOrigin.call(this)
	UpdateLog.internalItems = []
	UpdateLog.communityItems = []
	UpdateLog.currentMode = 'internal'
}

/* 设置图块标签 */
export const SetTileTag = {
	// properties
	callback: null,
	// methods
	initialize: null,
	open: null,
	// events
	windowClosed: null,
	confirm: null
}

SetTileTag.initialize = function () {
	$('#setTileTag').on('closed', this.windowClosed)
	$('#setTileTag-confirm').on('click', this.confirm)
}

SetTileTag.open = function (tag, callback) {
	this.callback = callback
	Window.open('setTileTag')
	$('#setTileTag-tag').write(tag)
	$('#setTileTag-tag').getFocus('all')
}

SetTileTag.windowClosed = function () {
	this.callback = null
}.bind(SetTileTag)

SetTileTag.confirm = function () {
	this.callback($('#setTileTag-tag').read())
	Window.close('setTileTag')
}.bind(SetTileTag)

export function loadDtsFolder(folderPath, monaco, recursive = true) {
	const disposables = []

	function walkDirectory(currentPath) {
		try {
			const files = fs.readdirSync(currentPath)

			files.forEach((file) => {
				const fullPath = Path.join(currentPath, file)

				const stat = fs.statSync(fullPath)

				if (stat.isDirectory()) {
					if (recursive) {
						walkDirectory(fullPath)
					}
				} else if (file.endsWith('.ts')) {
					try {
						const content = fs.readFileSync(fullPath, 'utf-8')

						const normalizedPath = fullPath.replace(/\\/g, '/')
						const fileUri = 'file://' + normalizedPath

						disposables.push(
							monaco.languages.typescript.javascriptDefaults.addExtraLib(
								content,
								fileUri
							)
						)
						disposables.push(
							monaco.languages.typescript.typescriptDefaults.addExtraLib(
								content,
								fileUri
							)
						)

						console.log(`[Monaco] Loaded d.ts: ${fileUri}`)
					} catch (readErr) {
						console.error(
							`Failed to read file: ${fullPath}`,
							readErr
						)
					}
				}
			})
		} catch (err) {
			console.error(`Failed to read directory: ${currentPath}`, err)
		}
	}

	walkDirectory(folderPath)

	return disposables
}

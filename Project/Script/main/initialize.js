'use strict'

// 初始化
Editor.initialize = async function () {
	// 关闭快捷键
	this.switchHotkey(false)

	// 加载配置数据
	try {
		// 提前初始化标题组件
		Title.initialize()
		const data = await window.config
		const code = JSON.stringify(data)
		this.config = data
		this.checkForEditorUpdates()
		Object.defineProperty(this.config, 'code', { value: code })
		delete window.config

		// 初始化组件对象
		// 注意：Inspector 必须早于 Command 初始化（Command.initialize 会遍历
		// Command.cases 并调用各 schema 的 onInitialize，其中依赖 Inspector
		// 已就绪；command-object.js 亦有注释标注此约束）。下方 initializedSet
		// 用于在开发期捕捉顺序错误。
		const initializedSet = new Set()
		const safeInit = (name) => {
			if (
				name === 'Command' &&
				!initializedSet.has('Inspector') &&
				typeof Log !== 'undefined' &&
				Log.warn
			) {
				Log.warn('初始化顺序错误：Inspector 必须在 Command 之前初始化')
			}
			const singleton = {
				Local,
				AudioManager,
				Menubar,
				Home,
				Layout,
				Timer,
				Scene,
				UI,
				Animation,
				Particle,
				Window,
				EventEditor,
				Inspector,
				Command,
				Project,
				Easing,
				Team,
				PluginManager,
				CustomCommand,
				Log,
				UpdateLog,
				Reference,
				Directory,
				Browser,
				Selector,
				Printer,
				Color,
				Variable,
				Attribute,
				Enum,
				Localization,
				ImageClip,
				Selection,
				Zoom,
				Rename,
				SetKey,
				SetQuantity,
				SetTileTag,
				PresetObject,
				PresetElement,
				ArrayList,
				AttributeListInterface,
				ConditionListInterface
			}[name]
			if (singleton && typeof singleton.initialize === 'function') {
				singleton.initialize()
				initializedSet.add(name)
			}
		}
		safeInit('Local')
		safeInit('AudioManager')
		safeInit('Menubar')
		safeInit('Home')
		safeInit('Layout')
		safeInit('Timer')
		safeInit('Scene')
		safeInit('UI')
		safeInit('Animation')
		safeInit('Particle')
		safeInit('Window')
		safeInit('EventEditor')
		safeInit('Inspector')
		safeInit('Command')
		safeInit('Project')
		safeInit('Easing')
		safeInit('Team')
		safeInit('PluginManager')
		safeInit('CustomCommand')
		safeInit('Log')
		safeInit('UpdateLog')
		safeInit('Reference')
		safeInit('Directory')
		safeInit('Browser')
		safeInit('Selector')
		safeInit('Printer')
		safeInit('Color')
		safeInit('Variable')
		safeInit('Attribute')
		safeInit('Enum')
		safeInit('Localization')
		safeInit('ImageClip')
		safeInit('Selection')
		safeInit('Zoom')
		safeInit('Rename')
		safeInit('SetKey')
		safeInit('SetQuantity')
		safeInit('SetTileTag')
		safeInit('PresetObject')
		safeInit('PresetElement')
		safeInit('ArrayList')
		safeInit('AttributeListInterface')
		safeInit('ConditionListInterface')

		// 加载配置文件
		this.loadConfig()
		Layout.manager.switch('home')
	} catch (error) {
		Log.throw(error)
		Window.confirm(
			{
				message: `Failed to initialize\n${error.message}`,
				close: () => {
					this.config = null
					this.quit()
				}
			},
			[
				{
					label: 'Confirm'
				}
			]
		)
	}
	EventBus.emit('editor_loaded')
}

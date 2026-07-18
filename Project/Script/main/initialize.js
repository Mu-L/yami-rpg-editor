'use strict'
import { Timer } from '../util/timer.js'
import { Variable } from '../variable/variable.js'
import '../variable/initialize.js'
import { Animation } from '../animation/animation-window.js'
import { Attribute } from '../attribute/attribute-window.js'
import { AudioManager } from '../audio/audio-manager.js'
import { Browser } from '../browser/project-browser.js'
import { Selector } from '../browser/resource-selector.js'
import { Command } from '../command/command-object.js'
import { CustomCommand } from '../command/custom-command-window.js'
import { EventEditor } from '../command/event-editor.js'
import { Project } from '../data/project-settings-window.js'
import { Team } from '../data/team-window.js'
import { Easing } from '../data/transition-window.js'
import { Enum } from '../enum/enum-window.js'
import { Directory } from '../file/directory-object.js'
import { Inspector } from '../inspector/inspector.js'
import { Layout } from '../layout/layout.js'
import { Localization } from '../local/local-window.js'
import { Log } from '../log/log-window.js'
import { Reference } from '../log/related-references.js'
import { UpdateLog } from '../log/update-log-window.js'
import { Editor } from './editor.js'
import { EventBus } from '../module/eventbus.js'
import { SetTileTag } from '../module/global.js'
import { Particle } from '../particle/particle-window.js'
import { PluginManager } from '../plugin/plugin.js'
import { Printer } from '../printer/printer.js'
import { Scene } from '../scene/scene-window.js'
import { Home } from '../title/home-page.js'
import { Menubar } from '../title/menu-bar.js'
import { Title } from '../title/title-bar.js'
import { ArrayList } from '../tools/array-window.js'
import { Color } from '../tools/color-picker-window.js'
import { ConditionListInterface } from '../tools/condition-list.js'
import { ImageClip } from '../tools/image-crop-window.js'
import { Local } from '../tools/localization.js'
import { PresetElement } from '../tools/preset-element-window.js'
import { AttributeListInterface } from '../tools/property-list.js'
import { Rename } from '../tools/rename-window.js'
import { PresetObject } from '../tools/scene-preset-window.js'
import { SetKey } from '../tools/set-key-window.js'
import { SetQuantity } from '../tools/set-number-window.js'
import { Selection } from '../tools/text-capture.js'
import { Window } from '../tools/window-object.js'
import { Zoom } from '../tools/zoom-window.js'
import { UI } from '../ui/ui-window.js'

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
		// 单例通过 dependsOn 声明依赖关系，启动期按拓扑排序初始化
		const initializedSet = new Set()
		const singletonMap = {
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
		}
		const initNames = Object.keys(singletonMap).filter(
			(n) => typeof singletonMap[n].initialize === 'function'
		)
		// 拓扑排序
		const graph = new Map(initNames.map((n) => [n, []]))
		const inDegree = new Map(initNames.map((n) => [n, 0]))
		for (const name of initNames) {
			const deps = singletonMap[name].dependsOn ?? []
			for (const dep of deps) {
				if (!graph.has(dep)) continue
				graph.get(dep).push(name)
				inDegree.set(name, inDegree.get(name) + 1)
			}
		}
		const queue = initNames.filter((n) => inDegree.get(n) === 0)
		while (queue.length) {
			const node = queue.shift()
			const singleton = singletonMap[node]
			// 用 .call(singleton) 绑定 this，否则严格模式裸调 initialize() 时 this === undefined，
			// 那些依赖 this.xxx 赋值的单例（如 Easing.initialize 设 this.startPoint）会炸
			singleton.initialize.call(singleton)
			initializedSet.add(node)
			for (const next of graph.get(node)) {
				inDegree.set(next, inDegree.get(next) - 1)
				if (inDegree.get(next) === 0) queue.push(next)
			}
		}
		// 循环依赖兜底
		for (const name of initNames) {
			if (!initializedSet.has(name)) {
				if (typeof Log !== 'undefined' && Log.warn) {
					Log.warn(
						`初始化循环依赖：${name} 未被初始化`,
						singletonMap[name].dependsOn
					)
				}
				singletonMap[name].initialize.call(singletonMap[name])
				initializedSet.add(name)
			}
		}

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

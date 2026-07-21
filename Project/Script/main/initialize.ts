import { Timer } from '../util/timer.ts';
import { Variable } from '../variable/variable.ts';
import '../variable/initialize.js';
import { Animation } from '../animation/animation-window.ts';
import { Attribute } from '../attribute/attribute-window.ts';
import { AudioManager } from '../audio/audio-manager.ts';
import { Browser } from '../browser/project-browser.ts';
import { Selector } from '../browser/resource-selector.ts';
import { Command } from '../command/command-object.ts';
import { CustomCommand } from '../command/custom-command-window.ts';
import { EventEditor } from '../command/event-editor.ts';
import { Project } from '../data/project-settings-window.ts';
import { Team } from '../data/team-window.ts';
import { Easing } from '../data/transition-window.ts';
import { Enum } from '../enum/enum-window.ts';
import { Directory } from '../file/directory-object.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Layout } from '../layout/layout.ts';
import { Localization } from '../local/local-window.ts';
import { Log } from '../log/log-window.ts';
import { Reference } from '../log/related-references.ts';
import { UpdateLog } from '../log/update-log-window.ts';
import { Editor } from './editor.ts';
import { EventBus } from '../module/eventbus.ts';
import { SetTileTag } from '../module/global.ts';
import { Particle } from '../particle/particle-window.ts';
import { PluginManager } from '../plugin/plugin.ts';
import { Printer } from '../printer/printer.ts';
import { Scene } from '../scene/scene-window.ts';
import { Home } from '../title/home-page.ts';
import { Menubar } from '../title/menu-bar.ts';
import { Title } from '../title/title-bar.ts';
import { ArrayList } from '../tools/array-window.ts';
import { Color } from '../tools/color-picker-window.ts';
import { ConditionListInterface } from '../tools/condition-list.ts';
import { ImageClip } from '../tools/image-crop-window.ts';
import { Local } from '../tools/localization.ts';
import { PresetElement } from '../tools/preset-element-window.ts';
import { AttributeListInterface } from '../tools/property-list.ts';
import { Rename } from '../tools/rename-window.ts';
import { PresetObject } from '../tools/scene-preset-window.ts';
import { SetKey } from '../tools/set-key-window.ts';
import { SetQuantity } from '../tools/set-number-window.ts';
import { Selection } from '../tools/text-capture.ts';
import { Window } from '../tools/window-object.ts';
import { Zoom } from '../tools/zoom-window.ts';
import { UI } from '../ui/ui-window.ts';

// 初始化
Editor.initialize = async function () {
	// 关闭快捷键
	this.switchHotkey(false);

	// 加载配置数据
	try {
		// 提前初始化标题组件
		Title.initialize();
		const data = await window.config;
		const code = JSON.stringify(data);
		this.config = data;
		this.checkForEditorUpdates();
		Object.defineProperty(this.config, 'code', { value: code });
		delete window.config;

		// 初始化组件对象
		// 单例通过 dependsOn 声明依赖关系，启动期按拓扑排序初始化
		const initializedSet = new Set();
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
		};
		const initNames = Object.keys(singletonMap).filter(
			(n) => typeof singletonMap[n].initialize === 'function'
		);
		// 拓扑排序
		const graph = new Map(initNames.map((n) => [n, []]));
		const inDegree = new Map(initNames.map((n) => [n, 0]));
		for (const name of initNames) {
			const deps = singletonMap[name].dependsOn ?? [];
			for (const dep of deps) {
				if (!graph.has(dep)) continue;
				graph.get(dep).push(name);
				inDegree.set(name, inDegree.get(name) + 1);
			}
		}
		const queue = initNames.filter((n) => inDegree.get(n) === 0);
		while (queue.length) {
			const node = queue.shift();
			const singleton = singletonMap[node];
			// 用 .call(singleton) 绑定 this，否则严格模式裸调 initialize() 时 this === undefined，
			// 那些依赖 this.xxx 赋值的单例（如 Easing.initialize 设 this.startPoint）会炸
			singleton.initialize.call(singleton);
			initializedSet.add(node);
			for (const next of graph.get(node)) {
				inDegree.set(next, inDegree.get(next) - 1);
				if (inDegree.get(next) === 0) queue.push(next);
			}
		}
		// 循环依赖兜底
		for (const name of initNames) {
			if (!initializedSet.has(name)) {
				if (typeof Log !== 'undefined' && (Log as any).warn) {
					(Log as any).warn(
						`初始化循环依赖：${name} 未被初始化`,
						singletonMap[name].dependsOn
					);
				}
				singletonMap[name].initialize.call(singletonMap[name]);
				initializedSet.add(name);
			}
		}

		// 加载配置文件
		this.loadConfig();
		Layout.manager.switch('home');
	} catch (error) {
		Log.throw(error);
		Window.confirm(
			{
				message: `Failed to initialize\n${error.message}`,
				close: () => {
					this.config = null;
					this.quit();
				}
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
	}
	EventBus.emit('editor_loaded');
};

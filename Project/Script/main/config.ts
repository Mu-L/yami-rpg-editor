import { GlobalPath, Path } from '../util/config.ts';
import { Animation } from '../animation/animation-window.ts';
import { FSP } from '../file/file-system.ts';
import { Layout } from '../layout/layout.ts';
import { Log } from '../log/log-window.ts';
import { Editor } from './editor.ts';
import { Particle } from '../particle/particle-window.ts';
import { Scene } from '../scene/scene-window.ts';
import { Title } from '../title/title-bar.ts';
import { UI } from '../ui/ui-window.ts';

// 保存配置文件
Editor.saveConfig = function () {
	const { config } = this;
	if (!config) {
		return;
	}
	try {
		Title.saveToConfig(config);
		Layout.saveToConfig(config);
		Scene.saveToConfig(config);
		UI.saveToConfig(config);
		Animation.saveToConfig(config);
		Particle.saveToConfig(config);

		// 写入配置文件
		const json = JSON.stringify(config, null, 2);
		const last = config.code;
		if (json && json !== last) {
			const path = Path.resolve(GlobalPath, 'config.json');
			FSP.writeFile(path, json).catch((error) => {
				Log.throw(error);
			});
		}
	} catch (error: any) {
		Log.throw(error);
	}
};

// 加载配置文件
Editor.loadConfig = function () {
	const { config } = this;
	// schema 兜底：旧配置或首次启动可能缺字段，缺失则用默认值
	// （与 Project/default.json 保持一致），避免下游直取炸
	if (config) {
		// colors：Scene/UI/Animation/Particle 的 StageColor 来源
		const colors = (config.colors ??= {});
		const colorDefaults = {
			sceneBackground: '00000000',
			uiBackground: '00000000',
			uiForeground: '000000ff',
			animationBackground: '203660ff',
			particleBackground: '203660ff'
		};
		for (const key in colorDefaults) {
			if (colors[key] === undefined) colors[key] = colorDefaults[key];
		}
		// dialogs：新建/打开/部署/导入/导出 各窗口的默认目录
		const dialogs = (config.dialogs ??= {});
		const dialogDefaults = {
			new: '',
			open: '',
			deploy: '',
			import: '',
			export: ''
		};
		for (const key in dialogDefaults) {
			if (dialogs[key] === undefined) dialogs[key] = dialogDefaults[key];
		}
		// scriptEditor：脚本编辑器模式与路径
		if (!config.scriptEditor) {
			config.scriptEditor = { mode: 'by-file-extension', path: '' };
		} else {
			config.scriptEditor.mode ??= 'by-file-extension';
			config.scriptEditor.path ??= '';
		}
		// 标量字段
		if (config.theme === undefined) config.theme = 'dark';
		if (config.language === undefined) config.language = '';
		if (config.project === undefined) config.project = '';
		// recent 必须是数组：旧配置可能存了 null/对象/字符串等非数组值，
		// 下游 Editor.updatePath 会调 items.find/remove/unshift，非数组会炸
		if (!Array.isArray(config.recent)) config.recent = [];
		if (config.zoom === undefined) config.zoom = 1;
	}
	Title.loadFromConfig(config);
	Layout.loadFromConfig(config);
	Scene.loadFromConfig(config);
	UI.loadFromConfig(config);
	Animation.loadFromConfig(config);
	Particle.loadFromConfig(config);
};

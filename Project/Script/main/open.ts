import { SettingConfig } from '../module/settingconfig.ts';
import { Path } from '../util/config.ts';
import { Animation } from '../animation/animation-window.ts';
import { Command } from '../command/command-object.ts';
import { Data } from '../data/data-object.ts';
import { Project } from '../data/project-settings-window.ts';
import { Directory } from '../file/directory-object.ts';
import { File } from '../file/file-system-core.ts';
import { FS } from '../file/file-system.ts';
import { Layout } from '../layout/layout.ts';
import { GameLocal } from '../local/local-object.ts';
import { Log } from '../log/log-window.ts';
import { Editor } from './editor.ts';
import { WebServer } from '../module/webserver.ts';
import { Printer } from '../printer/printer.ts';
import { Title } from '../title/title-bar.ts';
import { Local } from '../tools/localization.ts';
import { Window } from '../tools/window-object.ts';
import { Updater } from '../update/updater.ts';

// 打开项目
Editor.open = async function (path, agreed = false) {
	// 规范化路径分隔符
	path = Path.slash(path ?? this.config.project);

	// 路径为空则返回
	if (!path) {
		Layout.manager.switch('home');
		return;
	}

	// 验证路径有效性
	try {
		if (!FS.statSync(path).isFile()) {
			throw new Error('Invalid project path');
		}
	} catch (error) {
		Layout.manager.switch('home');
		return;
	}

	// 关闭项目
	await this.close();

	// 更新文件根目录
	File.updateRoot(path);

	// 获取本地化方法
	const get = Local.createGetter('confirmation');

	// 加载项目
	try {
		const json = FS.readFileSync(path, 'utf8');
		this.project = JSON.parse(json);
		Object.defineProperty(this.project, 'code', { value: json });
		const verNum = Updater.getVersionNumber(this.project.version);
		if (!Editor.isProjectVersionSupported()) {
			return Window.confirm(
				{
					message: get('versionIsTooHigh'),
					close: () => {
						Layout.manager.switch('home');
					}
				},
				[
					{
						label: get('confirm')
					}
				]
			);
		}
		// 升级到1.0.122：破坏性更新
		if (verNum < Updater.getVersionNumber('1.0.122')) {
			if (!agreed) {
				const warning = (Updater as any).getTSVersionWarning();
				return Window.confirm(
					{
						message: warning.message,
						close: () => {
							Layout.manager.switch('home');
						}
					},
					[
						{
							label: warning.confirm,
							click: () => {
								Editor.open(path, true);
							}
						},
						{
							label: warning.cancel
						}
					]
				);
			} else {
				Updater.backupProject();
			}
		}
	} catch (error) {
		Log.throw(error);
		return Window.confirm(
			{
				message: error.message,
				close: () => {
					Layout.manager.switch('home');
				}
			},
			[
				{
					label: get('confirm')
				}
			]
		);
	}

	// 加载数据文件
	try {
		const ver = this.project.version;
		const verNum = Updater.getVersionNumber(ver);
		await Updater.createLocalization(verNum);
		const loadData = Data.loadAll();
		const loadDir = Directory.read();
		await loadData;
		await loadDir;
		Data.inheritMetaData();
	} catch (error) {
		Log.throw(error);
		const type =
			error instanceof URIError
				? 'Failed to read file'
				: error instanceof SyntaxError
					? 'Syntax error'
					: 'Error';
		Directory.close();
		Data.close();
		return Window.confirm(
			{
				message: `${type}: ${error.message}`,
				close: () => {
					Layout.manager.switch('home');
				}
			},
			[
				{
					label: get('confirm')
				}
			]
		);
	}

	// 加载项目文件
	try {
		// 更新路径
		this.updatePath(path);

		// 加载完所有数据后再检查更新
		await this.checkForProjectUpdates();

		// 使用更新后的数据初始化
		Printer.loadDefault();
		Command.custom.loadCommandList();
		Animation.Player.updateStep();
		this.loadProject();
	} catch (error) {
		Log.throw(error);
		const index = path.lastIndexOf('/') + 1;
		const message = path.slice(index);
		Directory.close();
		Data.close();
		Window.confirm(
			{
				message: `Failed to read file: ${message}`,
				close: () => {
					Layout.manager.switch('home');
				}
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
		return;
	}

	// 设置状态
	this.state = 'open';

	// 打开快捷键
	this.switchHotkey(true);

	// 启动TS编译
	if (Data.config.script.autoCompile) {
		Project.startTSC();
	}

	// 更新标题名称
	Title.updateTitleName();

	// 初始化游戏本地化语言
	// 因为是追加的内容
	// 必须置于检查更新之后
	GameLocal.initialize();

	// 打开开发服务器
	// SettingConfig.config 在 SettingConfig 实例化期 load() 从 yami-config.json 载入；
	// 但若 load() 抛错或文件缺失未兜底，config.server 可能是 undefined，裸取 .auto 会炸
	const serverConfig = SettingConfig.config?.server ?? {};
	if (serverConfig.auto) WebServer.start(path);
};

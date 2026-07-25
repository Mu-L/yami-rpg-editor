import { $, getElementWriter } from '@/util/dom.ts';
import { GlobalPathForDir, GlobalPath } from '@/util/config.ts';
import { Window } from '@/tools/window-object.ts';
import { Local } from '@/tools/localization.ts';
import { ApkBuilder } from './apkbuilder.ts';
import { Resources } from './resource.ts';
import { WebServer } from './webserver.ts';
import nodeFs from 'node:fs';
import nodePath from 'node:path';
export const path = nodePath;

export const SettingConfig = new (class {
	config = {} as any;
	get homedir() {
		return GlobalPathForDir;
	}
	get configPath() {
		return path.join(GlobalPath, 'yami-config.json');
	}
	constructor() {
		// 启动期即从磁盘载入完整 config，避免下游裸取 config.github.* 时撞默认空 {} 的问题
		this.load();
		// 传 this.open 引用等 'open' 事件触发时才跑，避免加 () 立即调用时 Local 尚在 TDZ
		$('#setting').on('open', this.open.bind(this));
		$('#setting-confirm').on('click', () => {
			Window.close('setting');
		});
	}

	get defaultConfig() {
		return {
			server: {
				port: 5959,
				auto: false
			},
			apkbuild: {
				apkPath: '@/app-release.apk',
				outputDir: '$/decompiled',
				newApkPath: '$/app-release-re.apk',
				apktoolPath: '@/apktool.jar'
			},
			signed: {
				isSign: true,
				jksPath: '@/release.jks',
				keyStorePassword: '123456',
				keyAlias: 'xuran',
				keyPassword: '123456',
				apksignerPath: '@/apksigner.bat',
				zipalignPath: '@/zipalign.exe',
				signedApkPath: '$/app-debug-signed.apk'
			},
			other: {
				copyAsTextKeepEmptyLine: true,
				browserSearchHistoryLimit: 9
			},
			recent: {
				statsMode: 'count'
			},
			github: {
				accelerationNode: 'auto'
			},
			update: {
				checkOnStart: true
			}
		};
	}
	open() {
		this.load();
		$('#setting').on('closed', () => {
			SettingConfig.close();
		});

		const InputEvent = (e, summary, name) => {
			if (Reflect.has(e.target, 'value'))
				SettingConfig.config[summary][name] = e.target.value;
			else SettingConfig.config[summary][name] = e.value;
		};
		$('#setting-server-port').on('input', (e) => InputEvent(e, 'server', 'port'));
		$('#setting-server-auto').on('input', (e) => InputEvent(e, 'server', 'auto'));
		$('#setting-apkbuild-outputDir').on('input', (e) => InputEvent(e, 'apkbuild', 'outputDir'));
		$('#setting-apkbuild-outputDir').on('mouseenter', (e) =>
			$('#setting-apkbuild-outputDir').setTooltip(
				ApkBuilder.processPathOnly(SettingConfig.config.apkbuild.outputDir)
			)
		);
		$('#setting-apkbuild-newApkPath').on('input', (e) =>
			InputEvent(e, 'apkbuild', 'newApkPath')
		);
		$('#setting-apkbuild-apktoolPath').on('mouseenter', (e) =>
			$('#setting-apkbuild-apktoolPath').setTooltip(
				ApkBuilder.processPathOnly(SettingConfig.config.apkbuild.apktoolPath)
			)
		);
		$('#setting-apkbuild-apktoolPath').on('input', (e) =>
			InputEvent(e, 'apkbuild', 'apktoolPath')
		);
		$('#setting-apkbuild-apktoolPath').on('mouseenter', (e) =>
			$('#setting-apkbuild-apktoolPath').setTooltip(
				ApkBuilder.processPathOnly(SettingConfig.config.apkbuild.apktoolPath)
			)
		);
		$('#setting-signed-jksPath').on('input', (e) => InputEvent(e, 'signed', 'jksPath'));
		$('#setting-signed-jksPath').on('mouseenter', (e) =>
			$('#setting-signed-jksPath').setTooltip(
				ApkBuilder.processPathOnly(SettingConfig.config.signed.jksPath)
			)
		);
		$('#setting-signed-keyStorePassword').on('input', (e) =>
			InputEvent(e, 'signed', 'keyStorePassword')
		);
		$('#setting-signed-keyAlias').on('input', (e) => InputEvent(e, 'signed', 'keyAlias'));
		$('#setting-signed-keyPassword').on('input', (e) => InputEvent(e, 'signed', 'keyPassword'));
		$('#setting-signed-apksignerPath').on('input', (e) =>
			InputEvent(e, 'signed', 'apksignerPath')
		);
		$('#setting-signed-apksignerPath').on('mouseenter', (e) =>
			$('#setting-signed-apksignerPath').setTooltip(
				ApkBuilder.processPathOnly(SettingConfig.config.signed.apksignerPath)
			)
		);
		$('#setting-signed-zipalignPath').on('input', (e) =>
			InputEvent(e, 'signed', 'zipalignPath')
		);
		$('#setting-signed-zipalignPath').on('mouseenter', (e) =>
			$('#setting-signed-zipalignPath').setTooltip(
				ApkBuilder.processPathOnly(SettingConfig.config.signed.zipalignPath)
			)
		);
		$('#setting-signed-signedApkPath').on('input', (e) =>
			InputEvent(e, 'signed', 'signedApkPath')
		);
		$('#setting-signed-signedApkPath').on('mouseenter', (e) =>
			$('#setting-signed-signedApkPath').setTooltip(
				ApkBuilder.processPathOnly(SettingConfig.config.signed.signedApkPath)
			)
		);
		$('#setting-other-copyAsTextKeepEmptyLine').on('input', (e) =>
			InputEvent(e, 'other', 'copyAsTextKeepEmptyLine')
		);
		$('#setting-other-browserSearchHistoryLimit').on('input', (e) =>
			InputEvent(e, 'other', 'browserSearchHistoryLimit')
		);
		$('#setting-recent-statsMode').on('input', (e) => InputEvent(e, 'recent', 'statsMode'));
		$('#setting-github-accelerationNode').on('input', (e) =>
			InputEvent(e, 'github', 'accelerationNode')
		);
		$('#setting-update-checkOnStart').on('input', (e) =>
			InputEvent(e, 'update', 'checkOnStart')
		);
		this.update();
	}
	close() {
		this.save();
	}
	load() {
		if (!nodeFs.existsSync(this.configPath)) {
			nodeFs.writeFileSync(this.configPath, JSON.stringify(this.defaultConfig), 'utf-8');
			this.config = JSON.parse(JSON.stringify(this.defaultConfig));
			return;
		}
		this.config = JSON.parse(nodeFs.readFileSync(this.configPath, 'utf-8'));
		// 兜底：旧 yami-config.json 中某字段可能为 null（用户手动改或旧版写入），Reflect.has(null) 会抛错中断 load()
		const patch = (_p_obj, _t_obj) => {
			if (_t_obj === null || typeof _t_obj !== 'object') {
				_t_obj = {};
			}
			for (const key in _p_obj) {
				if (!Reflect.has(_t_obj, key)) {
					_t_obj[key] = _p_obj[key];
				}
				if (typeof _p_obj[key] === 'object') {
					_t_obj[key] = patch(_p_obj[key], _t_obj[key]);
				}
			}
			return _t_obj;
		};
		this.config = patch(this.defaultConfig, this.config);
		// 兜底：旧 yami-config.json 可能缺子段，patch() 对已存在但缺子字段的补不全，Object.assign 强合
		for (const key of Object.keys(this.defaultConfig)) {
			this.config[key] ??= {};
			for (const sub of Object.keys(this.defaultConfig[key])) {
				if (this.config[key][sub] === undefined) {
					this.config[key][sub] = this.defaultConfig[key][sub];
				}
			}
		}
		const browserSearchHistoryLimit = Math.floor(
			Number(this.config.other.browserSearchHistoryLimit)
		);
		this.config.other.browserSearchHistoryLimit = Number.isFinite(browserSearchHistoryLimit)
			? Math.min(Math.max(browserSearchHistoryLimit, 1), 9)
			: 9;
	}
	async update() {
		const get = Local.createGetter('confirmation');
		const githubNodes = [
			{
				name: get('github-acceleration-auto') || '自动选择',
				value: 'auto'
			}
		];

		if (typeof Resources !== 'undefined' && Resources._fastGithubArray) {
			Resources._fastGithubArray = await Resources.updateFastGithubArray();
			Resources._fastGithubArray.forEach((url, index) => {
				const nodeNumber = index + 1;
				const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
				const nodeLabel = get('github-acceleration-node') || '节点';
				githubNodes.push({
					name: `${nodeLabel} ${nodeNumber} (${domain})`,
					value: `node${nodeNumber}`
				});
			});
		}

		githubNodes.push({
			name: get('github-acceleration-none') || '不使用加速',
			value: 'none'
		});

		const browserSearchHistoryLimitItems = Array.from({ length: 9 }, (_, index) => {
			const value = index + 1;
			return {
				name: String(value),
				value
			};
		});

		const recentStatsModeItems = [
			{
				name: get('recent-statsMode-count') || 'Count (只统计数量)',
				value: 'count'
			},
			{
				name: get('recent-statsMode-size') || 'Size (计算大小)',
				value: 'size'
			}
		];

		$('#setting-other-browserSearchHistoryLimit').loadItems(browserSearchHistoryLimitItems);
		$('#setting-recent-statsMode').loadItems(recentStatsModeItems);

		$('#setting-title-recent').textContent = get('setting-title-recent') || 'Recent Projects';
		$('#setting-recent-statsMode-label').textContent =
			get('setting-recent-statsMode-label') || 'Stats Mode';
		$('#setting-title-update').textContent = get('setting-title-update') || 'Update';
		$('#setting-update-checkOnStart-label').textContent =
			get('setting-update-checkOnStart-label') || 'Check for updates on startup';

		window.on('localize', () => {
			const get = Local.createGetter('confirmation');
			$('#setting-title-recent').textContent =
				get('setting-title-recent') || 'Recent Projects';
			$('#setting-recent-statsMode-label').textContent =
				get('setting-recent-statsMode-label') || 'Stats Mode';
			$('#setting-title-update').textContent = get('setting-title-update') || 'Update';
			$('#setting-update-checkOnStart-label').textContent =
				get('setting-update-checkOnStart-label') || 'Check for updates on startup';

			const recentStatsModeItems = [
				{
					name: get('recent-statsMode-count') || 'Count Only',
					value: 'count'
				},
				{
					name: get('recent-statsMode-size') || 'Calculate Size',
					value: 'size'
				}
			];
			$('#setting-recent-statsMode').loadItems(recentStatsModeItems);
			$('#setting-recent-statsMode').write(this.config.recent.statsMode);
		});
		$('#setting-github-accelerationNode').loadItems(githubNodes);

		const write = getElementWriter('setting-server');
		write('port', this.config.server.port);
		write('auto', this.config.server.auto);
		const write2 = getElementWriter('setting-apkbuild');
		write2('outputDir', this.config.apkbuild.outputDir);
		write2('newApkPath', this.config.apkbuild.newApkPath);
		write2('apktoolPath', this.config.apkbuild.apktoolPath);
		const write3 = getElementWriter('setting-signed');
		write3('jksPath', this.config.signed.jksPath);
		write3('keyStorePassword', this.config.signed.keyStorePassword);
		write3('keyAlias', this.config.signed.keyAlias);
		write3('keyPassword', this.config.signed.keyPassword);
		write3('apksignerPath', this.config.signed.apksignerPath);
		write3('zipalignPath', this.config.signed.zipalignPath);
		write3('signedApkPath', this.config.signed.signedApkPath);
		const write4 = getElementWriter('setting-other');
		write4('copyAsTextKeepEmptyLine', this.config.other.copyAsTextKeepEmptyLine);
		write4('browserSearchHistoryLimit', this.config.other.browserSearchHistoryLimit);
		const write5 = getElementWriter('setting-recent');
		write5('statsMode', this.config.recent.statsMode);
		const write6 = getElementWriter('setting-github');
		write6('accelerationNode', this.config.github.accelerationNode);
		const write7 = getElementWriter('setting-update');
		write7('checkOnStart', this.config.update.checkOnStart);
	}
	save() {
		if (!nodeFs.existsSync(this.configPath)) {
			return nodeFs.writeFileSync(
				this.configPath,
				JSON.stringify(this.defaultConfig),
				'utf-8'
			);
		}
		nodeFs.writeFileSync(this.configPath, JSON.stringify(this.config), 'utf-8');
		this.apply();
	}
	apply() {
		if (WebServer.port !== this.config.server.port) {
			WebServer.port = this.config.server.port;
		}
	}
})();

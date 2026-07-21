import { ipcRenderer } from 'electron';
import nodePath from 'node:path';
import os from 'node:os';
import nodeFs from 'node:fs';
export const Path: typeof nodePath & { slash: (path: string) => string } =
	nodePath as any;

// const GlobalPathForDir = ipcRenderer.sendSync(
// 	'get-dir-path-sync',
// 	'app-data'
// )
// const ConfigDir = 'Open Yami RPG Editor'
export const GlobalPathForDir = os.homedir();
export const ConfigDir = '.openyami';
export const GlobalPath = Path.resolve(GlobalPathForDir, ConfigDir);

// ******************************** 读取配置文件 ********************************

{
	const dir = Path.resolve(GlobalPath);
	if (!nodeFs.existsSync(dir)) {
		nodeFs.mkdirSync(dir, { recursive: true });
	}
	// 提前读取配置文件以减少等待时间
	// promise.then的执行顺序在main.js之后
	// 文件名必须与 Editor.saveConfig（main/config.js）写入的路径一致，
	// 否则写到 config.json、读到 yami-config.json，配置无法持久化
	const configFile = Path.join(GlobalPath, 'config.json');
	window.config = nodeFs.promises
		.readFile(configFile, 'utf8')
		.then((json) => JSON.parse(json))
		.catch(() => {
			// 如果不存在配置文件或加载出错
			return import('../file/file-system-core.ts').then(({ File }) => {
				return File.get({
					local: 'default.json',
					type: 'json'
				}).then((config) => {
					// 设置默认配置属性
					config.theme = 'dark';
					config.language = '';
					config.project = '';
					config.recent = [];
					config.scriptEditor = {
						mode: 'by-file-extension',
						path: ''
					};
					return ipcRenderer
						.invoke('get-dir-path', 'documents')
						.catch((error) => 'C:')
						.then((docPath) => {
							for (const key of Object.keys(config.dialogs)) {
								config.dialogs[key] = (Path as any).slash(
									docPath
								);
							}
							return config;
						});
				});
			});
		});
}

// ESM 迁移兼容：恢复全局绑定（供尚未迁移的文件裸用）

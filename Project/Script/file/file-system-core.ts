import { ipcRenderer, shell } from 'electron';
import nodeFs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Path } from '@/util/config.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Data } from '@/data/data-object.ts';
import { FS, FSP } from './file-system.ts';
import { Log } from '@/log/log-window.ts';
import { Particle } from '@/particle/particle-window.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Cursor } from '@/tools/pointer-object.ts';
import { UI } from '@/ui/ui-window.ts';

type FileMethod = (...args: any[]) => any;

export const File: {
	root: string;
	promises: Record<string, any>;
	get: FileMethod | null;
	getPath: FileMethod | null;
	save: FileMethod | null;
	saveFile: FileMethod | null;
	planToSave: FileMethod | null;
	cancelSave: FileMethod | null;
	parseFileSize: FileMethod | null;
	getFileName: FileMethod | null;
	getImageResolution: FileMethod | null;
	openPath: FileMethod | null;
	openURL: FileMethod | null;
	showInExplorer: FileMethod | null;
	showOpenDialog: FileMethod | null;
	showSaveDialog: FileMethod | null;
	path: FileMethod | null;
	parseGUID: FileMethod | null;
	filterGUID: FileMethod | null;
	updateRoot: FileMethod | null;
	route: FileMethod | null;
} = {
	root: '',
	promises: {},
	get: null,
	getPath: null,
	save: null,
	saveFile: null,
	planToSave: null,
	cancelSave: null,
	parseFileSize: null,
	getFileName: null,
	getImageResolution: null,
	openPath: null,
	openURL: null,
	showInExplorer: null,
	showOpenDialog: null,
	showSaveDialog: null,
	path: null,
	parseGUID: null,
	filterGUID: null,
	updateRoot: null,
	route: null
};

// 开发模式取 process.cwd()/Project，生产模式从 HTML 文件位置推导避免 process.cwd() 不准确
function getFallbackRoot(): string {
	if ((import.meta as any).env?.DEV) {
		return Path.resolve(process.cwd(), 'Project');
	}
	return Path.dirname(fileURLToPath(document.baseURI));
}

File.get = function (descriptor) {
	let path;
	if (descriptor.path) {
		path = File.path(descriptor.path);
	} else if (descriptor.guid) {
		path = File.path(this.getPath(descriptor.guid));
	} else if (descriptor.local) {
		path = descriptor.local;
	} else {
		Log.throw(new Error('Invalid parameter'));
	}
	const type = descriptor.type;
	switch (type) {
		case 'image': {
			// 图像带 guid 时追加版本号到路径
			if (descriptor.guid) {
				const meta = Data.manifest.guidMap[descriptor.guid];
				if (meta) path += `?ver=${meta.mtimeMs}`;
			}
			const promises = this.promises;
			return (
				promises[path] ||
				(promises[path] = new Promise((resolve) => {
					const image = new Image();
					(image as any).guid = descriptor.guid ?? '';
					image.onload = () => {
						delete promises[path];
						image.onload = null;
						image.onerror = null;
						resolve(image);
					};
					image.onerror = () => {
						delete promises[path];
						image.onload = null;
						image.onerror = null;
						image.src = '';
						resolve(image);
					};
					image.src = File.route(path);
				}))
			);
		}
		default:
			// 中文文件名经 URI 编码后 XHR 找不到文件，改用 Node fs.readFileSync 直接读磁盘；loaderDescriptor 硬编码 type='json' 含 .ts 脚本，JSON.parse 失败时回退包装对象
			return new Promise((resolve, reject) => {
				try {
					const fs = nodeFs;
					const cleanPath = path.replace(/\?ver=\d+$/, '');
					const absPath = /^[A-Za-z]:[\\/]|^[/\\]/.test(cleanPath)
						? cleanPath
						: Path.resolve(this.root || getFallbackRoot(), cleanPath);
					const content = fs.readFileSync(absPath, 'utf-8');
					if (type === 'json') {
						try {
							resolve(JSON.parse(content));
						} catch {
							// 非 JSON 文件回退包装对象，避免 Object.defineProperty 对字符串抛错
							resolve({ code: content });
						}
					} else {
						resolve(content);
					}
				} catch {
					reject(new URIError(path));
				}
			});
	}
};

File.getPath = function (guid) {
	return Data.manifest.guidMap[guid]?.path ?? '';
};

File.save = function (hint = true) {
	Data.saveManifest();

	const { guidMap, changes } = Data.manifest;
	for (const meta of changes) {
		if (guidMap[meta.guid] === meta) {
			File.saveFile(meta);
		}
	}
	if (changes.length !== 0) {
		changes.length = 0;
	}

	if (hint) {
		Cursor.open('cursor-wait');
		setTimeout(() => {
			Cursor.close('cursor-wait');
		}, 100);
	}

	// 未处理写入失败的情况
	return ipcRenderer.invoke('wait-write-file');
};

File.saveFile = function (meta) {
	switch (meta) {
		case Scene.meta:
			Scene.save();
			break;
		case UI.meta:
			UI.save();
			break;
		case Animation.meta:
			Animation.save();
			break;
		case Particle.meta:
			Particle.save();
			break;
		case Data.manifest.project.variables:
			Data.generateVariableEnumScript();
			break;
	}
	let text;
	const data = meta.dataMap?.[meta.guid];
	switch (typeof data) {
		case 'object':
			meta.tryFixGuid?.(data);
			text = JSON.stringify(data, null, 2);
			break;
		default:
			return Promise.resolve();
	}
	const path = meta.path;
	const route = File.path(path);
	return FSP.writeFile(route, text, true as any)
		.then(() => {
			console.log(`write: ${path}`);
		})
		.catch((error) => {
			console.warn(error);
		});
};

File.planToSave = function (meta) {
	if (meta instanceof Object) {
		return Data.manifest.changes.append(meta);
	} else {
		throw new Error('Invalid file meta');
	}
};

File.cancelSave = function (meta) {
	return Data.manifest.changes.remove(meta);
};

File.parseFileSize = function (size) {
	let string;
	let unit;
	if (size < 1000) {
		unit = size === 1 ? 'byte' : 'bytes';
	} else {
		size /= 1024;
		if (size < 1000) {
			unit = 'KB';
		} else {
			size /= 1024;
			if (size < 1000) {
				unit = 'MB';
			} else {
				size /= 1024;
				unit = 'GB';
			}
		}
	}
	switch (unit) {
		case 'byte':
		case 'bytes':
			string = size.toString();
			break;
		default:
			if (size < 10) {
				string = size.toFixed(2);
			} else if (size < 100) {
				string = size.toFixed(1);
			} else {
				string = size.toFixed(0);
			}
			break;
	}
	return `${string}${unit}`;
};

File.getFileName = (function IIFE() {
	const struct = { path: '', route: '' };
	return function (dir, base, ext = '') {
		let path = `${dir}/${base}${ext}`;
		let route = File.path(path);
		if (FS.existsSync(route)) {
			// eslint-disable-next-line eslint/no-constant-condition
			for (let i = 1; true; i++) {
				path = `${dir}/${base} ${i}${ext}`;
				route = File.path(path);
				if (!FS.existsSync(route)) {
					break;
				}
			}
		}
		struct.path = path;
		struct.route = route;
		return struct;
	};
})();

File.getImageResolution = (function IIFE() {
	const promises = {};
	const resolution = { width: 0, height: 0 };
	return function (path) {
		let promise = promises[path];
		if (promise === undefined) {
			promise = promises[path] = new Promise((resolve, reject) => {
				const image = new Image();
				image.src = File.route(path);
				const intervalIndex = setInterval(() => {
					if (image.naturalWidth !== 0) {
						resolution.width = image.naturalWidth;
						resolution.height = image.naturalHeight;
						delete promises[path];
						clearInterval(intervalIndex);
						resolve(resolution);
						image.src = '';
					} else if (image.complete) {
						delete promises[path];
						clearInterval(intervalIndex);
						reject(new URIError('Image load failed.'));
					}
				});
			});
		}
		return promise;
	};
})();

File.openPath = function (path) {
	ipcRenderer.send('open-path', path);
};

File.openURL = function (url) {
	if (url) {
		void shell.openExternal(url);
	}
};

File.showInExplorer = function (path) {
	ipcRenderer.send('show-item-in-folder', path);
};

File.showOpenDialog = function (options) {
	return ipcRenderer.invoke('show-open-dialog', options);
};

File.showSaveDialog = function (options) {
	return ipcRenderer.invoke('show-save-dialog', options);
};

(File as any).parseMetaName = function (meta) {
	const alias = File.filterGUID(meta.path);
	const extname = Path.extname(alias);
	return Path.basename(alias, extname);
};

File.parseGUID = (function IIFE() {
	const regexp = /(?<=\.)[0-9a-f]{16}(?=\.\S+$)/;
	return function (filename) {
		const match = filename.match(regexp);
		return match ? match[0] : '';
	};
})();

File.filterGUID = (function IIFE() {
	const regexp = /\.[0-9a-f]{16}(?=\.\S+$)/;
	return function (filename) {
		return filename.replace(regexp, '');
	};
})();

File.updateRoot = function (path) {
	const index = path.lastIndexOf('/');
	this.root = path.slice(0, index + 1);
};

// this.root 为空时回退编辑器资源根，并清理尾随斜杠避免双斜杠
File.path = function (relativePath) {
	const isAbsolute = /^[A-Za-z]:[\\/]/.test(relativePath);
	if (isAbsolute) return relativePath;
	const base = this.root || getFallbackRoot();
	return base.replace(/[\\/]+$/, '') + '/' + relativePath;
};

File.route = function (relativePath) {
	const isAbsolute = /^[A-Za-z]:[\\/]/.test(relativePath);
	const base = (this.root || getFallbackRoot()).replace(/[\\/]+$/, '');
	const route = (isAbsolute ? relativePath : base + '/' + relativePath).replace(
		/[\\/]{2,}/g,
		'/'
	);
	if ((import.meta as any).env?.DEV) {
		return `/local-file/?path=${route.replace(/\?ver=(\d+)$/, '#ver=$1')}`;
	}
	return route;
};

// ESM 迁移兼容：恢复全局绑定（供尚未迁移的文件裸用）

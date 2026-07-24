import { ipcRenderer, shell } from 'electron';
import nodeFs from 'node:fs';
import { Path } from '../util/config.ts';
import { Animation } from '../animation/animation-window.ts';
import { Data } from '../data/data-object.ts';
import { FS, FSP } from './file-system.ts';
import { Log } from '../log/log-window.ts';
import { Particle } from '../particle/particle-window.ts';
import { Scene } from '../scene/scene-window.ts';
import { Cursor } from '../tools/pointer-object.ts';
import { UI } from '../ui/ui-window.ts';

// ******************************** 文件系统 ********************************

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
	// properties
	root: '',
	promises: {},
	// methods
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

// 获取文件
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
			// 如果图像存在guid
			// 文件路径添加版本号
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
			// 路径含中文文件名（如 zh-CN.简体中文.json）时，XHR open('GET', path) 会把
			// 中文 URI 编码成 %E7%AE%80...，但磁盘真文件名是未编码的，XHR 载不到报 URIError。
			// 改用 Node fs.readFileSync 直接读磁盘（Electron nodeIntegration:true 下可用，不经 URI 编码）
			// path 可能是：①裸文件名（'default.json'，资源根 Project/ 下）②相对路径（'Data/manifest.json'，
			//   用户游戏项目根下，File.root 在 open.js updateRoot 设）③绝对路径（'E:/...'）
			// 用 File.root 兜底：非空时 Path.resolve(File.root, path)（用户项目根），
			//   否则 Path.resolve(process.cwd(), 'Project', path)（编辑器资源根）
			// path 可能带 ?ver= 查询参数（File.get 的 Image 缓存用），fs.readFileSync 找不到会 ENOENT，
			// 用 URL 正则剥查询参数再读
			// type='json' 时 JSON.parse 解析；但 loaderDescriptor 对所有元数据文件硬编码 type='json'
			// （metadata.js:22），含 .ts 脚本文件——JSON.parse 抛 SyntaxError，不能一刀切 reject，
			// 否则 .ts 全读炸。改：JSON.parse 失败时回退原文本（兼容 .ts/.txt 等非 JSON 文件）
			return new Promise((resolve, reject) => {
				try {
					const fs = nodeFs;
					const cleanPath = path.replace(/\?ver=\d+$/, '');
					const absPath = /^[A-Za-z]:[\\/]|^[/\\]/.test(cleanPath)
						? cleanPath // 已是绝对路径（含盘符或 Unix 根）
						: Path.resolve(
								this.root || Path.resolve(process.cwd(), 'Project'),
								cleanPath
							);
					const content = fs.readFileSync(absPath, 'utf-8');
					if (type === 'json') {
						try {
							resolve(JSON.parse(content));
						} catch (parseError) {
							// 非 JSON 文件（如 .ts 脚本被 loaderDescriptor 硬编码 type='json'）回退包装对象。
							// 切忌回退裸字符串：metadata.js:74 Object.defineProperty(data,'guid',...) 调用字符串
							// 抛 called on non-object；且 Data.scripts[id] 调用方取 meta.code/meta.parameters 需对象形状。
							// 包装 { code: content } 让 metadata 能挂 guid、调用方能取 meta.code
							resolve({ code: content });
						}
					} else {
						resolve(content);
					}
				} catch (error: any) {
					reject(new URIError(path));
				}
			});
	}
};

// 获取路径
File.getPath = function (guid) {
	return Data.manifest.guidMap[guid]?.path ?? '';
};

// 保存项目
File.save = function (hint = true) {
	// 保存元数据清单文件
	Data.saveManifest();

	// 保存改变的文件
	const { guidMap, changes } = Data.manifest;
	for (const meta of changes) {
		// 验证元数据有效性
		if (guidMap[meta.guid] === meta) {
			File.saveFile(meta);
		}
	}
	if (changes.length !== 0) {
		changes.length = 0;
	}

	// 改变指针样式
	if (hint) {
		Cursor.open('cursor-wait');
		setTimeout(() => {
			Cursor.close('cursor-wait');
		}, 100);
	}

	// 这里没有考虑写入失败的情况
	return ipcRenderer.invoke('wait-write-file');
};

// 保存文件
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

// 计划保存
File.planToSave = function (meta) {
	if (meta instanceof Object) {
		return Data.manifest.changes.append(meta);
	} else {
		throw new Error('Invalid file meta');
	}
};

// 取消保存
File.cancelSave = function (meta) {
	return Data.manifest.changes.remove(meta);
};

// 解析文件大小
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

// 获取文件名称
File.getFileName = (function IIFE() {
	const struct = { path: '', route: '' };
	return function (dir, base, ext = '') {
		let path = `${dir}/${base}${ext}`;
		let route = File.path(path);
		if (FS.existsSync(route)) {
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

// 获取图像尺寸
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

// 打开资源管理器路径
File.openPath = function (path) {
	ipcRenderer.send('open-path', path);
};

// 打开URL
File.openURL = function (url) {
	if (url) {
		shell.openExternal(url);
	}
};

// 在资源管理器中显示
File.showInExplorer = function (path) {
	ipcRenderer.send('show-item-in-folder', path);
};

// 显示打开对话框
File.showOpenDialog = function (options) {
	return ipcRenderer.invoke('show-open-dialog', options);
};

// 显示保存对话框
File.showSaveDialog = function (options) {
	return ipcRenderer.invoke('show-save-dialog', options);
};

// 解析元数据对应的文件名称
(File as any).parseMetaName = function (meta) {
	const alias = File.filterGUID(meta.path);
	const extname = Path.extname(alias);
	return Path.basename(alias, extname);
};

// 解析文件名中的GUID
File.parseGUID = (function IIFE() {
	const regexp = /(?<=\.)[0-9a-f]{16}(?=\.\S+$)/;
	return function (filename) {
		const match = filename.match(regexp);
		return match ? match[0] : '';
	};
})();

// 过滤文件名中的GUID
File.filterGUID = (function IIFE() {
	const regexp = /\.[0-9a-f]{16}(?=\.\S+$)/;
	return function (filename) {
		return filename.replace(regexp, '');
	};
})();

// 更新根目录
File.updateRoot = function (path) {
	const index = path.lastIndexOf('/');
	this.root = path.slice(0, index + 1);
};

// 获取磁盘绝对路径（Node fs 操作用：FSP.stat/readdir/writeFile/rename/copyFile、FS.existsSync/readFileSync、
// File.openPath、Directory.readdir/trash 等）。dev/prod 同形，都原样回 this.root + relativePath，
// 不改写——Node fs.stat('/local-file/?path=...') 会当磁盘路径找炸报 ENOENT
// 兜底与 File.route 一致：this.root 空时回退 Path.resolve(process.cwd(),'Project')（编辑器资源根，
// Images/ 等内置资源在此下；scene-create-default-animation.js 等早于 updateRoot 跑的调用方依赖此）
// base 含尾 / 致 base+'/'+relativePath 拼出双斜杠——剥掉重根（Node fs 容忍双斜杠但严谨性需正）
File.path = function (relativePath) {
	const isAbsolute = /^[A-Za-z]:[\\/]/.test(relativePath);
	if (isAbsolute) return relativePath;
	const base = this.root || Path.resolve(process.cwd(), 'Project');
	return base.replace(/[\\/]+$/, '') + '/' + relativePath;
};

// 获取浏览器载 URL（Image.src/audio.src/video.src/CSS.encodeURL/FontFace 用）。
// prod 模式（Electron file:// 协议）原样透传 file:// URL；
// dev 模式（Vite dev server http://localhost:5173）浏览器从 http origin 载 file:// 被安全策略拒收，
// 报 Not allowed to load local resource——改走 /local-file/?path= 代理前缀，vite.config.js 配 proxy
// 用 fs.readFile 读磁盘后回 blob URL（避中文路径 URI 编码 + file:// 协议限制）
// relativePath 可能是：①裸相对路径（'Images/foo.png' 或 'Assets/...'，需拼 this.root）
// ②绝对路径（'E:/...'，File.get 入口 File.path 已拼好，再拼 this.root 会重复）——入口判含盘符则不加根
// this.root 在 open.js updateRoot 设成用户项目根，但部分调用方（如 scene-create-default-animation.js
// 用 local:'Images/default_actor.png' 载编辑器内置资源）早于 updateRoot 跑——此时 this.root='' 致
// ''+relativePath 原样回相对路径，vite proxy 拿裸相对路径当磁盘路径找炸 404。
// 兜底：this.root 空时回退 Path.resolve(process.cwd(),'Project')（编辑器资源根，Images/ 等内置资源在此下）
// dev 段完全不编码传裸字符串：浏览器 Image.src setter 会 URI 编码中文一次（单编码），
// vite proxy url.searchParams.get('path') 自动解码回裸字符串读磁盘。
// 切忌 encodeURI/encodeURIComponent：前者编码中文成 %E4%B8%AD，浏览器 src 再编码 %→%25 双编码；
// 后者更编码 : / ? = 致路径全炸。
// 路径末尾的 cache busting 段 ?ver=123 会被 URL 解析成额外 query param 分隔掉——
// dev 段改写成 #ver=123 fragment（浏览器不编码 #，URL 把 # 后算 hash 不当 query 分隔，
// vite proxy bypass 段用正则剥 #ver= 段后读磁盘；ver 仅做浏览器缓存 bust 不用读）
File.route = function (relativePath) {
	const isAbsolute = /^[A-Za-z]:[\\/]/.test(relativePath);
	const base = (this.root || Path.resolve(process.cwd(), 'Project')).replace(/[\\/]+$/, '');
	// 绝对路径原样透传但剥连续斜杠（this.root 含尾 / + relativePath 含前 / 时拼出双斜杠，
	// vite proxy readFileSync 找炸 ENOENT）；相对路径拼 base+'/'+relativePath
	const route = (isAbsolute ? relativePath : base + '/' + relativePath).replace(
		/[\\/]{2,}/g,
		'/'
	);
	if ((import.meta as any).env?.DEV) {
		// ?ver= 改 #ver= fragment 避被 URL 当 query 分隔；裸字符串让浏览器 src 自己编码
		return `/local-file/?path=${route.replace(/\?ver=(\d+)$/, '#ver=$1')}`;
	}
	return route;
};

// ESM 迁移兼容：恢复全局绑定（供尚未迁移的文件裸用）

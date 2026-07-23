import { request } from '../util/dom.ts';
import { Data } from '../data/data-object.ts';
import { Meta } from '../data/metadata.ts';
import { File } from './file-system-core.ts';
import { FSP } from './file-system.ts';
import { GUID } from './guid.ts';
import { Local } from '../tools/localization.ts';
import { Window } from '../tools/window-object.ts';
import { Path } from '../util/config.ts';
import { GL } from '../webgl/webgl-init.ts';

// ******************************** 文件项目 ********************************

export class FileItem {
	meta: any | null;
	name: string;
	alias: string;
	aliasPath: string;
	basename: string;
	extname: string;
	path: string;
	type: string;
	stats: any | null;
	promise: Promise<any> | null;
	contexts: any | null;

	constructor(name: string, extname: string, path: string, type: string, stats: any) {
		let basename = Path.basename(name, extname);
		const match = basename.match(FileItem.guidRegExp);
		if (match) basename = basename.slice(0, match.index - 1);
		this.meta = null;
		this.name = name;
		this.alias = basename + extname;
		this.aliasPath = Path.dirname(path) + '/' + this.alias;
		this.basename = basename;
		this.extname = extname;
		this.path = path;
		this.type = type;
		this.stats = stats;
		this.contexts = null;

		// 创建元数据
		this.createMeta(match?.[0]);

		// 加载脚本
		switch (type) {
			case 'image':
				GL.textureManager.updateImage(this.meta.guid);
				break;
			case 'script':
				Data.loadScript(this);
				break;
		}
	}

	// 读取数据
	get data() {
		const { meta } = this;
		const { guid } = meta;
		const { guidMap } = Data.manifest;
		if (guidMap[guid] === meta) {
			return meta.dataMap?.[guid];
		}
		return undefined;
	}

	// 创建元数据
	createMeta(guid: any) {
		const stats = this.stats;
		// 如果GUID不存在或冲突则新建GUID
		// 如果GUID重复则不要修改避免丢失
		if (guid === undefined) {
			do {
				guid = GUID.generate64bit();
			} while (Data.manifest.guidMap[guid]);
			this.updateFileName(guid);
		} else {
			const meta = Data.manifest.guidMap[guid];
			// 如果存在元数据并且并未被使用，则重定向或删除该元数据
			// 如果存在元数据并且已经被使用，则文件GUID冲突
			if (meta && meta.versionId !== Meta.versionId) {
				if (meta.redirect(this)) {
					this.meta = meta;
					this.updateFileName(guid);
					return;
				}
				Data.manifest.deleteMeta(meta);
			} else if (meta) {
				FileItem.addGuidConflictPaths(meta.path, this.path + '(已隐藏)');
				throw new Error(`GUID already exists: ${guid}`);
			}
		}
		this.meta = new Meta(this, guid);
		this.meta.mtimeMs = stats.mtimeMs;
	}

	// 更新文件名称
	updateFileName(guid: any) {
		const basename = this.basename;
		const extname = this.extname;
		// 如果代码被修改可能导致批量的错误命名结果
		// 因此进行文件名组成部分类型检查
		if (
			typeof guid !== 'string' ||
			typeof basename !== 'string' ||
			typeof extname !== 'string'
		) {
			throw new Error('Failed to update File Name');
		}
		const name = `${basename}.${guid}${extname}`;
		if (this.name !== name) {
			const dir = Path.dirname(this.path);
			const path = `${dir}/${name}`;
			const sPath = File.path(this.path);
			const dPath = File.path(path);
			const promise = this.promise ?? Promise.resolve();
			this.promise = promise.then(() => {
				return FSP.rename(sPath, dPath).then(() => {
					// console.log(this.name, this.path)
					this.name = name;
					this.path = path;
					this.meta?.redirect(this);
					// console.log(this.meta.path)
				});
			});
		}
	}

	// 获取上下文对象
	getContext(key: any) {
		let contexts = this.contexts;
		if (contexts === null) {
			contexts = this.contexts = new Map();
		}
		let context = contexts.get(key);
		if (context === undefined) {
			contexts.set(key, (context = {}));
		}
		return context;
	}

	// 静态属性 - 数据映射表的名称
	static dataMapNames = {
		actor: 'actors',
		skill: 'skills',
		trigger: 'triggers',
		item: 'items',
		equipment: 'equipments',
		state: 'states',
		event: 'events',
		scene: 'scenes',
		tileset: 'tilesets',
		ui: 'ui',
		animation: 'animations',
		particle: 'particles',
		script: 'scripts'
	};

	// 静态属性 - GUID正则表达式
	static guidRegExp = /(?<=\.)[0-9a-f]{16}$/;

	// 静态属性 - GUID冲突路径列表
	static guidConflictPaths = [];

	// 静态属性 - 过大图像路径列表
	static oversizeImagePaths = [];

	// 静态方法 - 判断是不是数据文件
	static isDataFile(file: any) {
		return FileItem.dataMapNames[file.type] !== undefined;
	}

	// 静态方法 - 添加冲突路径
	static addGuidConflictPaths(...paths) {
		for (const path of paths) {
			this.guidConflictPaths.append(path);
		}
		request(this.warnGuidConflicts);
	}

	// 静态方法 - 警告GUID冲突
	static warnGuidConflicts() {
		const warnings = [Local.get('confirmation.guidConflict')];
		Window.confirm(
			{
				message: warnings.concat(FileItem.guidConflictPaths).join('\n')
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
		FileItem.guidConflictPaths.length = 0;
	}

	// 静态方法 - 添加过大图像路径
	static addOversizeImagePaths(...paths) {
		for (const path of paths) {
			this.oversizeImagePaths.append(path);
		}
		request(this.warnOversizeImages);
	}

	// 静态方法 - 警告过大图像
	static warnOversizeImages() {
		const warnings = [Local.get('confirmation.oversizeImage').replace('<size>', GL.maxTexSize)];
		Window.confirm(
			{
				message: warnings.concat(FileItem.oversizeImagePaths).join('\n')
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
		FileItem.oversizeImagePaths.length = 0;
	}
}

import path from 'node:path';

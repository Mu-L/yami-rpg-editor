import { Path } from '../util/config.ts';
import { Meta } from '../data/metadata.ts';
import { FileItem } from './file-item.ts';
import { File } from './file-system-core.ts';
import { FSP } from './file-system.ts';

export class FolderItem {
	name: string;
	path: string;
	stats: any | null;
	parent: FolderItem | null;
	children: FileItem[];
	subfolders: FolderItem[];
	contexts: Map<string, any> | null;

	constructor(name: string, path: string, parent: FolderItem | null) {
		this.name = name;
		this.path = path;
		this.stats = null;
		this.parent = parent;
		this.children = Array.empty as unknown as FileItem[];
		this.subfolders = Array.empty as unknown as FolderItem[];
		this.contexts = null;
	}

	getContext(key: string): any {
		let contexts = this.contexts;
		if (contexts === null) {
			contexts = this.contexts = new Map();
		}
		let context = contexts.get(key);
		if (context === undefined) {
			contexts.set(
				key,
				(context = {
					expanded: false
				})
			);
		}
		return context;
	}

	async update(context = { changed: false, promises: [] }) {
		const bigint = FolderItem.bigint;
		const path = File.path(this.path);
		const pStat = FSP.stat(path, bigint);
		const pReaddir = this.readdir(context);
		const stats = await pStat;
		if (this.stats?.mtimeMs !== stats.mtimeMs) {
			context.changed = true;
		}
		this.stats = stats;
		await pReaddir;
		return context;
	}

	async readdir(context) {
		const map = {};
		const nodes = this.children;
		if (nodes instanceof Array) {
			const length = nodes.length;
			for (let i = 0; i < length; i++) {
				const item = nodes[i];
				map[item.path] = item;
			}
		}

		const dir = this.path;
		const path = File.path(dir);
		const files = await FSP.readdir(path, { withFileTypes: true });
		const length = files.length;
		const promises = new Array(length);
		const children = [];
		const subfolders = [];
		const bigint = FolderItem.bigint;
		for (let i = 0; i < length; i++) {
			const file = files[i];
			const name = file.name;
			const path = `${dir}/${name}`;
			if (file.isDirectory()) {
				let item = map[path];
				if (!(item instanceof FolderItem)) {
					item = new FolderItem(name, path, this);
					context.changed = true;
				}
				promises[i] = item.update(context);
				children.push(item);
				subfolders.push(item);
			} else {
				// 跳过MacOS隐藏文件
				if (name === '.DS_Store') {
					continue;
				}
				const promise = FSP.stat(File.path(path), bigint);
				(promise as any).path = path;
				promises[i] = promise;
			}
		}

		const { extnameToTypeMap } = FolderItem;
		for (let i = 0; i < length; i++) {
			const promise = promises[i];
			const response = await promise;
			if (promise?.path === undefined) {
				continue;
			}
			const path = promise.path;
			const stats = response;
			let item = map[path];
			if (item === undefined || item.stats.mtimeMs !== stats.mtimeMs) {
				const name = files[i].name;
				const extname = Path.extname(name);
				const type = extnameToTypeMap[extname.toLowerCase()] ?? 'other';
				try {
					item = new FileItem(name, extname, path, type, stats);
					if (item.promise instanceof Promise) {
						context.promises.push(
							item.promise.finally(() => {
								delete item.promise;
							})
						);
					}
				} catch (error: any) {
					console.warn(error);
					continue;
				}
			}
			if (item.meta.versionId !== Meta.versionId) {
				item.meta.versionId = Meta.versionId;
				children.push(item);
				context.changed = true;
			}
		}
		this.children = children;
		this.subfolders = subfolders;
	}

	static extnameToTypeMap = {
		'.actor': 'actor',
		'.skill': 'skill',
		'.trigger': 'trigger',
		'.item': 'item',
		'.equip': 'equipment',
		'.state': 'state',
		'.event': 'event',
		'.scene': 'scene',
		'.tile': 'tileset',
		'.ui': 'ui',
		'.anim': 'animation',
		'.particle': 'particle',
		'.png': 'image',
		'.jpg': 'image',
		'.jpeg': 'image',
		'.cur': 'image',
		'.webp': 'image',
		'.mp3': 'audio',
		'.m4a': 'audio',
		'.ogg': 'audio',
		'.wav': 'audio',
		'.flac': 'audio',
		'.mp4': 'video',
		'.mkv': 'video',
		'.webm': 'video',
		'.js': 'script',
		'.ts': 'script',
		'.ttf': 'font',
		'.otf': 'font',
		'.woff': 'font',
		'.woff2': 'font'
	};

	static bigint = { bigint: true };

	static async create(path) {
		const name = Path.basename(path);
		const item = new FolderItem(name, path, null);
		return item;
	}
}

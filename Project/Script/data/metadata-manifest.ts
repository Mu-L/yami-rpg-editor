import { Data } from './data-object.ts';
import { Meta } from './metadata.ts';
import { File } from '@/file/file-system-core.ts';
import { Title } from '@/title/title-bar.ts';

export class Manifest {
	actors: any[] = [];
	skills: any[] = [];
	triggers: any[] = [];
	items: any[] = [];
	equipments: any[] = [];
	states: any[] = [];
	events: any[] = [];
	scenes: any[] = [];
	tilesets: any[] = [];
	ui: any[] = [];
	animations: any[] = [];
	particles: any[] = [];
	images: any[] = [];
	metaList: any[] = [];
	guidMap: Record<string, any> = {};
	pathMap: Record<string, any> = {};
	changed: boolean = false;
	audio: any[] = [];
	videos: any[] = [];
	fonts: any[] = [];
	script: any[] = [];
	others: any[] = [];
	// 以下字段由 constructor 内 Object.defineProperties 挂载（非枚举）
	declare project: Record<string, any>;
	declare changes: any[];
	declare code: string;

	constructor() {
		Object.defineProperties(this, {
			metaList: { value: [] },
			guidMap: { value: {} },
			pathMap: { value: {} },
			project: { value: {} },
			changes: { value: [] },
			changed: { writable: true, value: false },
			code: { writable: true, value: '' }
		});
	}

	update() {
		const { metaList } = this;
		const { versionId } = Meta;
		let i = metaList.length;
		while (--i >= 0) {
			const meta = metaList[i];
			// 如果版本ID不一致，表示文件已被删除
			if (meta.versionId !== versionId) {
				this.deleteMeta(meta);
			}
		}
	}

	deleteMeta(meta: any) {
		const { guidMap } = this;
		const { pathMap } = this;
		const { guid, path } = meta;
		this.metaList.remove(meta);
		meta.group.remove(meta);
		if (guidMap[guid] === meta) {
			delete guidMap[guid];
		}
		if (pathMap[path] === meta) {
			delete pathMap[path];
		}
		const { dataMap } = meta;
		if (dataMap) {
			File.cancelSave(meta);
			switch (dataMap) {
				case Data.scenes:
				case Data.ui:
				case Data.animations:
				case Data.particles:
					Title.tabBar.closeByProperty('meta', meta);
					break;
			}
			switch (dataMap) {
				case Data.scenes:
					Data.unregisterScenePresets(guid);
					break;
				case Data.ui:
					Data.unregisterUiPresets(guid);
					break;
			}
			delete dataMap[guid];
		}
		this.changed = true;
		console.log(`delete meta: ${meta.path}`);
	}
}

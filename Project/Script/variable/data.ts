import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Variable } from './variable.ts';

Variable.unpackVariables = (function IIFE() {
	class ReferencedFolder {
		data: any;
		class: string;
		name: string;
		children: any[];
		constructor(item: any) {
			this.data = item;
			this.class = item.class;
			this.name = item.name;
			this.children = clone(item.children);
		}

		get expanded() {
			return this.data.expanded;
		}

		set expanded(value: any) {
			this.data.expanded = value;
			File.planToSave(Data.manifest.project.variables);
		}
	}
	const clone = (items) => {
		const length = items.length;
		const copies = Array(length);
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				Variable.idMap[item.id] = true;
				copies[i] = Object.clone(item);
			} else {
				copies[i] = new ReferencedFolder(item);
			}
		}
		return copies;
	};
	return function () {
		this.idMap = {};
		this.data = clone(Data.variables);
	};
})();

Variable.packVariables = (function IIFE() {
	const clone = (items) => {
		const length = items.length;
		const copies = Array(length);
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item);
			} else {
				copies[i] = {
					class: item.class,
					name: item.name,
					expanded: item.expanded,
					children: clone(item.children)
				};
			}
		}
		return copies;
	};
	return function () {
		Data.variables = clone(this.data);
		Data.createVariableMap();
	};
})();

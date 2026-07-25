import { Local } from '@/tools/localization.ts';
import { TreeDataItem, TreeDataGroup, TreeDataCache, TreeDataLists } from '@/types/tree-data.ts';

export class TreeDataContext {
	itemMap: Record<string, TreeDataItem>;
	groupMap: Record<string, TreeDataGroup>;
	itemCache: TreeDataCache;
	itemLists: TreeDataLists;

	constructor(data: any, keysField: any) {
		const itemMap = {};
		const groupMap = {};

		const load = (groupKeys, items) => {
			for (const item of items) {
				const itemKey = item.id;
				itemMap[itemKey] = item;
				if (item.class === 'folder') {
					groupMap[itemKey] = {
						groupName: item.name,
						itemMap: {},
						itemList: []
					};
					groupKeys.push(itemKey);
					load(groupKeys, item.children);
					groupKeys.pop();
					continue;
				}
				for (let i = 0; i < groupKeys.length; i++) {
					const group = groupMap[groupKeys[i]];
					group.itemMap[itemKey] = item;
					group.itemList.push(item);
				}
			}
		};
		load([], data[keysField]);

		const settings = data.settings;
		for (const [key, groupId] of Object.entries(settings)) {
			if ((groupId as any) in groupMap) {
				groupMap[key as any] = groupMap[groupId as any];
			} else {
				if (groupId !== '') {
					settings[key] = '';
				}
				groupMap[key] = {
					groupName: '',
					itemMap: Object.empty,
					itemList: Array.empty
				};
			}
		}
		this.itemMap = itemMap;
		this.groupMap = groupMap;
		this.itemCache = {};
		this.itemLists = {};
	}

	getGroup(groupKey: any) {
		return this.groupMap[groupKey];
	}

	getCachedItems(key: any, builder: any) {
		if (!this.itemLists[key]) {
			this.itemLists[key] = builder();
		}
		return this.itemLists[key];
	}

	createItem(id: any, name: any, extra: any) {
		return { name, value: id, ...extra };
	}

	createNoneItem() {
		return {
			name: Local.get('common.none'),
			value: ''
		};
	}
}

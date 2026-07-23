import { Local } from '../tools/localization.ts';
import {
	TreeDataItem,
	TreeDataGroup,
	TreeDataCache,
	TreeDataLists
} from '../types/tree-data.ts';

// ******************************** 树形数据上下文基类 ********************************

export class TreeDataContext {
	itemMap: Record<string, TreeDataItem>;
	groupMap: Record<string, TreeDataGroup>;
	itemCache: TreeDataCache;
	itemLists: TreeDataLists;

	constructor(data: any, keysField: any) {
		const itemMap = {};
		const groupMap = {};

		// 加载数据
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

		// 移除无效的分组设置
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

	// 获取群组
	getGroup(groupKey: any) {
		return this.groupMap[groupKey];
	}

	// 获取选项列表（带缓存）
	getCachedItems(key: any, builder: any) {
		if (!this.itemLists[key]) {
			this.itemLists[key] = builder();
		}
		return this.itemLists[key];
	}

	// 构建基础选项项
	createItem(id: any, name: any, extra: any) {
		return { name, value: id, ...extra };
	}

	// 构建无选项
	createNoneItem() {
		return {
			name: Local.get('common.none'),
			value: ''
		};
	}
}

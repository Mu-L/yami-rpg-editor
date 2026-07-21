import { TreeDataContext } from '../components/tree-data-context.ts';
import { GameLocal } from '../local/local-object.ts';
import { Local } from '../tools/localization.ts';

// ******************************** 枚举上下文类 ********************************

export class EnumerationContext extends TreeDataContext {
	constructor(enumeration) {
		super(enumeration, 'strings');
	}

	// 获取枚举字符串对象
	getString(stringId) {
		return this.itemMap[stringId];
	}

	// 获取群组枚举字符串对象
	getGroupString(groupKey, stringId) {
		return this.groupMap[groupKey]?.itemMap[stringId];
	}

	// 获取默认枚举字符串ID
	getDefStringId(groupKey) {
		return this.groupMap[groupKey]?.itemList[0]?.id ?? '';
	}

	// 获取枚举字符串选项列表
	getStringItems(groupKey, allowNone = false) {
		let key = groupKey;
		if (allowNone) {
			key += '-allowNone';
		}
		return this.getCachedItems(key, () => {
			const items = [];
			const group = this.groupMap[groupKey];
			if (group) {
				const itemCache = this.itemCache;
				for (const string of group.itemList) {
					let item = itemCache[string.id];
					if (item === undefined) {
						item = itemCache[string.id] = {
							value: string.id
						};
					}
					const name = GameLocal.replace(string.name);
					item.name = name;
					item.tip = string.note
						? Local.parseTip(string.note, name)
						: undefined;
					items.push(item);
				}
			}
			if (allowNone) {
				items.unshift(this.createNoneItem());
			}
			if (items.length === 0) {
				items.push(this.createNoneItem());
			}
			return items;
		});
	}

	// 获取合并的选项列表
	getMergedItems(headItems, groupKey, mergedKey = 'merged') {
		const key = `${groupKey}-${mergedKey}`;
		return this.getCachedItems(key, () => {
			const items = [...headItems];
			const group = this.groupMap[groupKey];
			if (group) {
				const itemCache = this.itemCache;
				for (const string of group.itemList) {
					let item = itemCache[string.id];
					if (item === undefined) {
						item = itemCache[string.id] = {
							value: string.id
						};
					}
					const name = GameLocal.replace(string.name);
					item.name = name;
					item.tip = string.note
						? Local.parseTip(string.note, name)
						: undefined;
					items.push(item);
				}
			}
			return items;
		});
	}
}

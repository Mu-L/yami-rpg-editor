import { TreeDataContext } from '@/components/tree-data-context.ts';
import { GameLocal } from '@/local/local-object.ts';
import { Local } from '@/tools/localization.ts';

export class EnumerationContext extends TreeDataContext {
	constructor(enumeration: any) {
		super(enumeration, 'strings');
	}

	getString(stringId: string): any {
		return this.itemMap[stringId];
	}

	getGroupString(groupKey: string, stringId: string): any {
		return this.groupMap[groupKey]?.itemMap[stringId];
	}

	getDefStringId(groupKey: string): string {
		return this.groupMap[groupKey]?.itemList[0]?.id ?? '';
	}

	getStringItems(groupKey: string, allowNone: boolean = false): any[] {
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
					item.tip = string.note ? Local.parseTip(string.note, name) : undefined;
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

	getMergedItems(headItems: any, groupKey: any, mergedKey: any = 'merged') {
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
					item.tip = string.note ? Local.parseTip(string.note, name) : undefined;
					items.push(item);
				}
			}
			return items;
		});
	}
}

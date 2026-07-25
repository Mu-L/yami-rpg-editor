import { TreeDataContext } from '@/components/tree-data-context.ts';
import { GameLocal } from '@/local/local-object.ts';

export class AttributeContext extends TreeDataContext {
	constructor(attribute: any) {
		super(attribute, 'keys');
	}

	getAttribute(attrId: string): any {
		return this.itemMap[attrId];
	}

	getGroupAttribute(groupKey: string, attrId: string): any {
		return this.groupMap[groupKey]?.itemMap[attrId];
	}

	getDefAttributeId(groupKey: string, type?: string): string {
		const group = this.groupMap[groupKey];
		if (group) {
			for (const attr of group.itemList) {
				if (!type || attr.type === type) {
					return attr.id;
				}
			}
		}
		return '';
	}

	getAttributeItems(groupKey: string, attrType: string = '', allowNone: boolean = false): any[] {
		let key = groupKey + attrType;
		if (allowNone) {
			key += '-allowNone';
		}
		return this.getCachedItems(key, () => {
			const items = [];
			const group = this.groupMap[groupKey];
			if (group) {
				const attrTypes = attrType.split(' ');
				if (attrTypes.includes('string')) {
					attrTypes.append('enum');
				}
				const itemCache = this.itemCache;
				for (const attr of group.itemList) {
					if (!attrType || attrTypes.includes(attr.type)) {
						let item = itemCache[attr.id];
						if (item === undefined) {
							item = itemCache[attr.id] = {
								name: GameLocal.replace(attr.name),
								value: attr.id
							};
						}
						items.push(item);
					}
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
}

import { TreeDataContext } from '../components/tree-data-context.ts';
import { GameLocal } from '../local/local-object.ts';

// ******************************** 属性上下文类 ********************************

export class AttributeContext extends TreeDataContext {
	constructor(attribute) {
		super(attribute, 'keys');
	}

	// 获取属性
	getAttribute(attrId) {
		return this.itemMap[attrId];
	}

	// 获取群组属性
	getGroupAttribute(groupKey, attrId) {
		return this.groupMap[groupKey]?.itemMap[attrId];
	}

	// 获取默认属性ID
	getDefAttributeId(groupKey, type) {
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

	// 获取属性选项列表
	getAttributeItems(groupKey, attrType = '', allowNone = false) {
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

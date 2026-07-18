'use strict'
import { Local } from '../tools/localization.js'

// ******************************** 树形数据上下文基类 ********************************

export class TreeDataContext {
	itemMap //:object
	groupMap //:object
	itemCache //:object
	itemLists //:object

	constructor(data, keysField) {
		const itemMap = {}
		const groupMap = {}

		// 加载数据
		const load = (groupKeys, items) => {
			for (const item of items) {
				const itemKey = item.id
				itemMap[itemKey] = item
				if (item.class === 'folder') {
					groupMap[itemKey] = {
						groupName: item.name,
						itemMap: {},
						itemList: []
					}
					groupKeys.push(itemKey)
					load(groupKeys, item.children)
					groupKeys.pop()
					continue
				}
				for (let i = 0; i < groupKeys.length; i++) {
					const group = groupMap[groupKeys[i]]
					group.itemMap[itemKey] = item
					group.itemList.push(item)
				}
			}
		}
		load([], data[keysField])

		// 移除无效的分组设置
		const settings = data.settings
		for (const [key, groupId] of Object.entries(settings)) {
			if (groupId in groupMap) {
				groupMap[key] = groupMap[groupId]
			} else {
				if (groupId !== '') {
					settings[key] = ''
				}
				groupMap[key] = {
					groupName: '',
					itemMap: Object.empty,
					itemList: Array.empty
				}
			}
		}
		this.itemMap = itemMap
		this.groupMap = groupMap
		this.itemCache = {}
		this.itemLists = {}
	}

	// 获取群组
	getGroup(groupKey) {
		return this.groupMap[groupKey]
	}

	// 获取选项列表（带缓存）
	getCachedItems(key, builder) {
		if (!this.itemLists[key]) {
			this.itemLists[key] = builder()
		}
		return this.itemLists[key]
	}

	// 构建基础选项项
	createItem(id, name, extra) {
		return { name, value: id, ...extra }
	}

	// 构建无选项
	createNoneItem() {
		return {
			name: Local.get('common.none'),
			value: ''
		}
	}
}

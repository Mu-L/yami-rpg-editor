// ******************************** 树形数据上下文共用类型 ********************************

/**
 * TreeDataContext 的 itemMap / groupMap / itemCache / itemLists 字段契约。
 *
 * 替代 components/tree-data-context.ts:6-9 的 `Record<string, any>` 残留，
 * 收敛为精确接口。
 */

/** 树形数据项（item 是 {name?, value, ...extra}，name 在部分场景缺省） */
export interface TreeDataItem {
	name?: string;
	value: string;
	[key: string]: any;
}

/** 树形数据分组（groupMap[itemKey] = {groupName, itemMap, itemList}） */
export interface TreeDataGroup {
	groupName: string;
	itemMap: Record<string, TreeDataItem>;
	itemList: TreeDataItem[];
}

/** 树形数据项缓存（itemCache） */
export type TreeDataCache = Record<string, TreeDataItem>;

/** 树形数据项列表（itemLists，builder() 产物） */
export type TreeDataLists = Record<string, TreeDataItem[]>;

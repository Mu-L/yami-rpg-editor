// TreeDataContext 的 itemMap / groupMap / itemCache / itemLists 字段契约。 替代 components/tree-data-context.ts:6-9 的 `Record<string, any>` 残留， 收敛为精确接口。

export interface TreeDataItem {
	name?: string;
	value: string;
	[key: string]: any;
}

export interface TreeDataGroup {
	groupName: string;
	itemMap: Record<string, TreeDataItem>;
	itemList: TreeDataItem[];
}

export type TreeDataCache = Record<string, TreeDataItem>;

export type TreeDataLists = Record<string, TreeDataItem[]>;

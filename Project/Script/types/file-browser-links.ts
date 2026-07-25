// FileBrowser / FileNavPane / FileHeadPane / FileBodyPane 4 类共享的反向链接对象。 替代 components/file-browser.ts:42 / file-nav-pane.ts:28 / file-body-pane.ts:52 的 `links: Record<string, any>` 残留，收敛为精确接口。
export interface FileBrowserLinks {
	browser: HTMLElement & {
		display: 'normal' | 'search';
		backupFolders: any[];
		filters: any[] | null;
		searchResults: any[];
		getFilePaths(files: any[]): { absolutePaths: string[] };
		backToParentFolder(): boolean;
		restoreDisplay(): void;
		update(): void;
	};
	nav: HTMLElement & {
		selections: any[];
		load(...folders: any[]): void;
		scrollToSelection(mode?: string): void;
	};
	head: HTMLElement;
	body: HTMLElement;
}

import { IArrayHistory } from '@/types/history.ts';

export class History extends Array implements IArrayHistory {
	index: number;
	capacity: number;
	onSave: ((data: any) => void) | null;
	onRestore: ((data: any) => void) | null;

	constructor(capacity: number) {
		super();
		this.index = -1;
		this.capacity = capacity;
		this.onSave = null;
		this.onRestore = null;
	}

	reset(): void {
		if (this.length !== 0) {
			this.length = 0;
			this.index = -1;
		}
	}

	save(data: any): void {
		const length = this.index + 1;
		if (length < this.length) {
			this.length = length;
		}

		if (this.length < this.capacity) {
			this.index++;
			this.push(data);
		} else {
			this.shift();
			this.push(data);
		}

		this.onSave?.(data);
	}

	restore(operation: any) {
		const index =
			operation === 'undo' ? this.index : operation === 'redo' ? this.index + 1 : null;

		if (index >= 0 && index < this.length) {
			const data = this[index];
			const processors = History.processors;
			const processor = processors[data.type];
			if (processor) {
				processor(operation, data);

				switch (operation) {
					case 'undo':
						this.index--;
						break;
					case 'redo':
						this.index++;
						break;
				}

				this.onRestore?.(data);
			}
		}
	}

	canUndo() {
		return this !== null && this.index >= 0;
	}

	canRedo() {
		return this !== null && this.index + 1 < this.length;
	}

	static processors = {};
}

// ESM 迁移兼容：恢复全局绑定（供尚未迁移的文件裸用）

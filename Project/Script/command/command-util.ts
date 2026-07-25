import { Command } from './command-object.ts';

Command.forEachCommand = function (commands: any[], handler: (command: any) => void): void {
	const forEach = (commands: any[]): void => {
		for (const command of commands) {
			handler(command);
			switch (command.id) {
				case 'showChoices':
					for (const choice of command.params.choices) {
						forEach(choice.commands);
					}
					continue;
				case 'if':
					for (const branch of command.params.branches) {
						forEach(branch.commands);
					}
					if (command.params.elseCommands) {
						forEach(command.params.elseCommands);
					}
					continue;
				case 'switch':
					for (const branch of command.params.branches) {
						forEach(branch.commands);
					}
					if (command.params.defaultCommands) {
						forEach(command.params.defaultCommands);
					}
					continue;
				case 'loop':
					forEach(command.params.commands);
					continue;
				case 'forEach':
					forEach(command.params.commands);
					continue;
				case 'independent':
					forEach(command.params.commands);
					continue;
				case 'transition':
					forEach(command.params.commands);
					continue;
			}
		}
	};
	forEach(commands);
};

// 注：WordList.push 必须返回 this 以支持链式契约（showText.ts / transition.ts / jumpTo.ts / renderOutline.ts 等依赖 `words.push(x).push(y)` 链式）。TS2416 不允许子类把继承方法改成不兼容签名 —— 故 WordList 不 extends Array，改为独立类持数组 + 声明索引访问/length/迭代等数组语义，让外部仍可当数组用。
Command.WordList = class WordList {
	count: number = 0;
	#arr: string[] = [];

	constructor() {
		this.count = 0;
	}

	push(string: string): this {
		if (string) this.#arr[this.count++] = string;
		return this;
	}

	join(joint: string = '$_delimiter_$, $_/_$'): string {
		const length = this.count;
		if (length === 0) {
			return '';
		}
		this.count = 0;
		const arr = this.#arr;
		let string = arr[0];
		for (let i = 1; i < length; i++) {
			string += joint + arr[i];
		}
		return string;
	}

	get length(): number {
		return this.count;
	}
	*[Symbol.iterator](): IterableIterator<string> {
		const arr = this.#arr;
		for (let i = 0; i < this.count; i++) yield arr[i];
	}
};

interface WordList {
	[index: number]: string;
}
